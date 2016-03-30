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
    this.reason = null; // reasons can't change
    this._resolveChain = [];
    this.fn = fn;
    var that = this;


    var run = function (next) {
    };

    var startChain = function (chain, args) {
      var ii;
      var chainLength = chain.length;
      for (ii = 0; ii < chainLength; ii++) {
        run(chain[ii]);
      }
    };

    var toArray = function (args) {
      return Array.prototype.slice.call(args, 0);
    };

    this.resolve = function (value) {
      if (that._state === states.PENDING) {
        that._state = states.FULFILLED;
        that.reason = toArray(arguments);
        startChain(that._resolveChain, that.reason);
      }

      return this;
    };

    this.reject = function (reason) {
      if (that._state === states.REJECTED) {
        that._state = states.REJECTED;
      }
      return this;
    };

    this.then = function (resolve, reject) {
      var vP = new vPromise();
      var onFulfilled;
      var onRejected;
      if (typeof resolve === "function") {
        onFulfilled = function () {
          vP.resolve.apply(that, arguments);
        };
      }
      if (typeof reject === "function") {
        onRejected = function () {
          vP.reject.apply(that, arguments);
        };
      }

      onFulfilled.next = onRejected.next = vP;

      that._resolveChain.push({vp: vP, args: arguments});
      this.resolve();
      return vP;
    };

    return this;
  };

  vPromise.resolve = function (value) {
    var resolve;
    var vP = new vPromise(function (_resolve) {
      resolve = _resolve;
    });
    vP.fn(function (value) {
      return value;
    });
    resolve(value);
    return vP;
  };

  vPromise.reject = function (reason) {
    var vP = new vPromise();
    vP.reject(reason);
    return vP;
  };

  if (typeof module != 'undefined') {
    module.exports = vPromise;
  }

}());
