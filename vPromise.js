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

    var onFullfilled = function (resolve) {
      if (that._state === states.PENDING) {
        that._state = state.FULFILLED;
        resolve();
        return;
      }
    };

    var onReject = function (reject, reason) {
      if (that._state === states.FULFILLED || that._state == states.REJECTED) {
        return;
      }
      this._state = states.REJECTED;
      reject(); 
    };

    var handle = function (resolve, reject, next) {
      if (that._state !== states.PENDING) {
        return;
      }

      try {
        fn(onFullfilled(resolve), onReject(reject));
      } catch (e) {
      }
    };

    var p = {};

    this.then = function (resolve, reject) {
      var next = new vPromise(fn);
      handle(resolve, reject, next);
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
    return skipped;
  }

  vPromise.reject = function (reason) {
    var skipped = new vPromise(skip);
    return doReject(skipped, reason);
  };

  function doReject(skipped, reason) {
    skipped._state = states.REJECTED;
    return skipped;
  }

  if (typeof module != 'undefined') {
    module.exports = vPromise;
  }

}());
