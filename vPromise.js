(function () {
  'use strict';

  function debug() {
    console.log(arguments);
  }

  function skip() { return function (){} }

  var toArray = function (args) {
    return Array.prototype.slice.call(args, 0);
  };

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


  var _reject = function (promise, r) {

  }

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


  var pushOnFulfilled = function(that, onFulfilled) {
    if (that._state == states.PENDING) {
      onFulfilled.status = states.PUSHEDFULFILLED;
      that.chain.push(onFulfilled);
    }
    if (that._state == states.FULFILLED) {
      _resolve(that);
    }
  };

  var vPromise = function (fn) {
    this._state = states.PENDING;
    this.value = null;
    this.chain = [];
    var that = this;

    if (fn !== skip) {
      fn(function (val) {
        that.value = val;
      }, function () {

      });
    }

    this.then = function (resolve, reject) {
      var vP = new vPromise(skip);
      vP._state = states.PUSHEDFULFILLED;
      _resolve(vP, that.value);

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
