(function () {
  'use strict';

  function skip() { return function (){} }

  var isObject = function (obj) {
    return typeof obj !== 'undefined' && obj.toString() == "[object Object]";
  };

  var isFunction = function (func) {
    return typeof func === "function";
  }


  var states = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
    PUSHEDFULFILLED: 3,
    PUSHEDREJECTED: 4
  };

  var u = undefined;

  function asap(cb) {
    setTimeout(cb, 1);
  }

  var vPromise = function (fn) {
    this.value = undefined;
    this.state = states.PENDING;
    this.chain = [];
    var prms = this;

    try {
      fn(function (val) {
        prms.resolve(val);
      }, function (reason) {
        prms.reject(reason);
      });
    } catch (exc) {
      prms.reject(exc);
    }

    this.then = function (onFulfilled, onRejected) {
      var prms = this;

      return new vPromise(function (resolve, reject) {
        prms.chain.push({
          onFulfilled: onFulfilled,
          resolve: resolve,
          onRejected: onRejected,
          reject: reject
        });

        prms.done();
      });
    };
    return this;
  };

  vPromise.prototype.done = function () {
    var prms = this;

    asap(function () {
      if (prms._state == states.PENDING) {
        return;
      }

      var chainLength = prms.chain.length;
      if (chainLength == 0) { // nothing to do
        return;
      }

      var ii;
      var next;
      var onFulfilled, resolve, onRejected, reject;
      for (ii = 0; ii < chainLength; ii++) {
        next = prms.chain.shift();

        onFulfilled = next.onFulfilled;
        resolve = next.resolve;
        onRejected = next.onRejected;
        reject = next.reject;

        if (prms._state === states.FULFILLED) {
          resolve(onFulfilled.call(u, prms.value));
        }
      }
      prms.chains = []; // done with chains
    });
  };

  vPromise.prototype.resolve = function (x) {
    var prms = this;

    if (prms === x) {
      throw new TypeError("promise and x can not be same object");
    }
    if (isFunction(x) || isObject(x)) {
      var then = x.then; // TODO 2.3.3.2
    }

    if (isFunction(then)) {
      var called = false;
      then.call(x, function (y) {
        if (called) {
          return;
        }
        called = true;
        prms.resolve(prms, y);
      }, function (r) {
        if (called) {
          return;
        }
        called = true;
        prms.reject(prms, r);
      });
    }
    prms._state = states.FULFILLED;
    prms.value = x;
    prms.done();
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
