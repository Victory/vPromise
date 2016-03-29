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

  function asap(cb) {
    setTimeout(cb, 1);
  }

  var vPromise = function (fn) {
    this._state = states.PENDING;
    this.value = null;
    this._resolveChain = [];

    var that = this;

    var onFulfilled = function (resolve, val) {
      if (typeof resolve !== 'function') { // 2.2.1
        return;
      }
      var ii;
      var chainLength = that._resolveChain.length;
      for (ii = 0; ii < chainLength; ii++) {
        try {
          that._resolveChain[ii](val);
        } catch (e) {}
      }
      resolve(val);
      if (that._state !== states.PENDING) {
        that._state = states.FULFILLED;
      }
    };

    var onReject = function (reject, reason) {
      if (typeof reject !== 'function') { // 2.2.1
        return;
      }
      if (that._state !== states.PENDING && that._state !== states.FULFILLED) {
        that._state = states.REJECTED;
        reject(reason);
      }
    };

    var handle = function (resolve, reject) {
      if (that._state === states.PENDING) {
        return;
      }

      var val = that.value;
      asap(function () {
          try {
            fn(onFulfilled(resolve,val), onReject(reject, that.reason));
          } catch (e) {
            debug(e);
          }
      });
    };

    if (fn !== skip) {
      fn(function (value) {
        that.value = value;
        asap(function () {
          if (that._state !== states.PENDING) {
            return;
          }
          var ii;
          var chainLength = that._resolveChain.length;
          for (ii = 0; ii < chainLength; ii++) {
            try {
              that._resolveChain[ii](value);
            } catch (e) {}
          }
          that._resolve(value);
          that._state = states.FULFILLED;
         });
      },
      function (reason) {
        that.reason = reason;
        asap(function () {
          if (that._state !== states.PENDING) {
            return;
          }
          that._reject(reason);
          that._state = states.REJECTED;
         });
      });
    }

    this.then = function (resolve, reject) {
      if (that._state === states.PENDING) {
        if (typeof that._resolve == "function") {
          that._resolveChain.push(that._resolve);
        }
        that._resolve = resolve;
        that._reject = reject;
        return;
      }

      var next = new vPromise(fn);
      handle(resolve, reject);
      next._state = -1; // placeholder
      return next;
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
