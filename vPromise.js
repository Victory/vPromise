(function () {
  'use strict';

  function debug() {
    debugger;
    console.log(arguments);
  }

  function skip() {};

  var states = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
  };

  var vPromise = function (fn) {
    var state = states.PENDING;
    var value;
    var cbChains = [];
    var that = this;

    if (fn === skip) {
      return;
    }

    var onFullfilled = function (resolve) {
      debug('onFullfilled');
      if (state === states.FULFILLED || state == states.REJECTED) {
        return;
      }
      state = state.FULFILLED;
      resolve(); 
    };

    var onReject = function (reject, reason) {
      debug('onReject');
      if (state === states.FULFILLED || state == states.REJECTED) {
        return;
      }
      state = states.REJECTED;
      reject(); 
    };

    var handle = function (cur, resolve, reject, next) {
      debug(cur);
      if (cur.state !== states.pending) {
        return;
      }
 
      try {
        fn(onFullfilled(resolve), onReject(reject));
      } catch (e) {
        debug('catch', e);
      } 
    };

    var p = {};

    p.then = function (resolve, reject) {
      debug('then', fn);
      var next = new vPromise(skip);
      //handle(this, resolve, reject, next);
      return next;
    };

    p.catch = function (fn) {
    };

    return p;
  };
  vPromise._state = states.PENDING;

  vPromise.resolve = function (value) {
    var skipped = new vPromise(skip);
    return doResolve(skipped, value);
  };

  function doResolve(skipped, value) {
    console.log(skipped); 
  }

  vPromise.reject = function (value) {
  };

  if (typeof module != 'undefined') {
    module.exports = vPromise;
  }
}());
