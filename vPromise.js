(function () {
  'use strict';

  function debug() {
    console.log(arguments);
  }

  function skip() { return function (){} }

  var states = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
    PUSHEDFULFILLED: 3,
    PUSHEDREJECTED: 4
  };

  function asap(cb) {
    setTimeout(cb, 1);
  }

  var vPromise = function (fn) {
    this._state = states.PENDING;
    this.value = null;
    this.reason = null; // reasons can't change
    this.chain = [];
    this.next = fn;
    var that = this;


    var run = function (next) {
    };

    var startChain = function (chain) {
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
        startChain(that.resolveChain, that.reason);
      }

      return this;
    };

    this.reject = function (reason) {
      if (that._state === states.REJECTED) {
        that._state = states.REJECTED;
      }
      return this;
    };

    this.pushFulfilled = function(onFulfilled) {
      if (that._state == states.PENDING) {
        onFulfilled.status = states.PUSHEDFULFILLED;
        that.chain.push(onFulfilled);
      }
      if (that._state == states.FULFILLED) {
        this.resolve();
      }
    };

    this.then = function (resolve, reject) {
      var vP = new vPromise();
      var onFulfilled;
      var onRejected;

      if (typeof resolve !== "function") {
        resolve = skip();
      }
      onFulfilled = function () {
        resolve();
      }

      if (typeof reject !== "function") {
        reject = skip();
      }
      onRejected = function () {
        reject();
      }

      onRejected.vP = onFulfilled.vP = vP;

      this.pushFulfilled(onFulfilled);

      return vP;
    };


    return this;
  };

  vPromise.resolve = function (value) {
    var vP = new vPromise();
    vP._state = states.FULFILLED;
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
