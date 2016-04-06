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
  var whoisIndex = 0;
  var vPromise = function (fn) {
    this._state = states.PENDING;
    this.value = null;
    this.reason = null; // reasons can't change
    this.chain = [];
    var whois = whoisIndex++;
    this.next = fn;
    var that = this;


    var run = function (next, val) {
      next(val);
    };

    var startChain = function (val) {
      var ii;
      var chain = that.chain;
      var chainLength = chain.length;
      for (ii = 0; ii < chainLength; ii++) {
        val = run(chain[ii], val);
      }
    };

    var toArray = function (args) {
      return Array.prototype.slice.call(args, 0);
    };

    this._resolve = function () {
      if (that._state === states.PENDING) {
        that._state = states.FULFILLED;
        asap(function () {
          if (typeof that.next === "function") { // XXX
            that.next(function (val) {
              that.value = val;
              startChain(val);
            });
          }
        });
      }

      return this;
    };

    this.reject = function (reason) {
      if (that._state === states.REJECTED) {
        that._state = states.REJECTED;
      }
      return this;
    };

    this.pushOnFulfilled = function(onFulfilled) {
      if (that._state == states.PENDING) {
        onFulfilled.status = states.PUSHEDFULFILLED;
        onFulfilled.vP.chain.push(onFulfilled);
      }
      if (that._state == states.FULFILLED) {
        this._resolve();
      }
    };

    this.then = function (resolve, reject) {
      console.log(whois);
      var vP = new vPromise();
      var onFulfilled;
      var onRejected;

      if (typeof resolve !== "function") {
        resolve = skip();
      }
      onFulfilled = function (val) {
        resolve(val);
      };

      if (typeof reject !== "function") {
        reject = skip();
      }
      onRejected = function (reason) {
        reject(reason);
      };

      onRejected.vP = onFulfilled.vP = vP;

      this.pushOnFulfilled(onFulfilled);

      this._resolve();
      return vP;
    };

    return this;
  };

  vPromise.resolve = function (value) {
    var vP = new vPromise();
    vP._state = states.FULFILLED;
    vP.value = value;
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
