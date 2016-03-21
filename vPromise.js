(function () {
  'use strict';

  function debug() {
    console.log(arguments);
  }

  function skip() {}

  var states = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2
  };

  var vPromise = function (fn) {
    this._state = states.PENDING;
    this.value = null;
    var that = this;

    var onFulfilled = function (resolve) {
      if (typeof resolve !== 'function') { // 2.2.1
        return;
      }

      if (that._state !== states.PENDING) {
        that._state = states.FULFILLED;
        resolve(that.value);
      }
    };

    var onReject = function (reject, reason) {
      if (typeof reject !== 'function') { // 2.2.1
        return;
      }
      if (that._state !== states.PENDING) {
        that._state = states.REJECTED;
        reject(reason);
      }
    };

    var handle = function (resolve, reject) {
      if (that._state === states.PENDING) {
        return;
      }

      try {
        fn(onFulfilled(resolve), onReject(reject));
      } catch (e) {
        debug(e);
      }
    };

    if (fn !== skip) {
      fn(function (value) {
        that.value = value;
        setTimeout(function () {
          if (that._state !== states.PENDING) {
            return;
          }
          that._resolve(value);
          that._state = states.FULFILLED;
         }, 1);
      },
      function (reason) {
        that.reason = reason;
      });
    }

    this.then = function (resolve, reject) {
      if (that._state === states.PENDING) {
        that._resolve = resolve;
        that._reject = reject;
        return;
      }
      var next = new vPromise(fn);
      handle(resolve, reject, next);
      next._state = -1; // placeholder
      return next;
    };

    this.catch = function (fn) {
    };

    return this;
  };

  vPromise.resolve = function (value) {
    var skipped = new vPromise(skip);
    return doResolve(skipped, value);
  };

  function doResolve(skipped, value) {
    skipped._state = states.FULFILLED;
    skipped.value = value;
    return skipped;
  }

  vPromise.reject = function (reason) {
    var skipped = new vPromise(skip);
    return doReject(skipped, reason);
  };

  function doReject(skipped, reason) {
    skipped._state = states.REJECTED;
    skipped.reason = reason;
    return skipped;
  }


  if (typeof module != 'undefined') {
    module.exports = vPromise;
  }

}());
