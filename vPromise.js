(function () {
  'use strict';

  function skip() { return function (){} }

  var isObject = function (obj) {
    return obj.toString() == "[object Object]";
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

  function asap(cb) {
    setTimeout(cb, 1);
  }

  var run = function (next, val) {
    if (next.status !== states.PENDING) {
      return;
    }
    next.status = states.FULFILLED;
    next.value = next(val);
    return next.value;
  };

  var startChain = function () {
    var ii;
    var chain = this.chain;
    var chainLength = chain.length;
    var val;

    if (this._state == states.PUSHEDFULFILLED) {
      this._state = states.FULFILLED;
      val = this.value;
    } else {
      //val = ;
    }
    for (ii = 0; ii < chainLength; ii++) {
      run(chain[ii], val);
    }
  };


  var _resolve = function (promise, x) {
    if (promise === x) {
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
        _resolve(promise, y);
      }, function (r) {
        if (called) {
          return;
        }
        called = true;
        _reject(promise, r);
      });
    }
  };


  var pushOnFulfilled = function(onFulfilled, onRejected) {
    if (onFulfilled.status == states.PENDING) {
      this.chain.push(onFulfilled);
    }
  };

  var vPromise = function (fn) {
    this._state = states.PENDING;
    var value = null;
    this.chain = [];
    var that = this;

    if (fn !== skip) {
      fn(function (val) {
        that.value = val;
        that._state = states.PUSHEDFULFILLED;
      }, function () {

      });
    }

    this.then = function (resolve, reject) {
      var vP = new vPromise(skip);
      vP._state = states.PENDING;
      vP.chain = this.chain;
      var onFulfilled = function (val) {
        return resolve(val);
      };
      onFulfilled.status = states.PENDING;
      onFulfilled.vP = vP;
      pushOnFulfilled.call(that, onFulfilled, reject);
      startChain.call(vP);
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
