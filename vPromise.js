(function () {
  'use strict';

  function debug() {
    console.log(arguments);
  }

  debugger;

  var states = {
    UNFULFILLED: 0,
    FULFILLED: 1,
    REJECTED: 2,
  };

  var vPromise = function (resolver) {
    var state = states.UNFULFILLED;
    var resultion;

    var onFullfilled = function () {
      debug('onFullfilled', arguments);
    };

    var onReject = function () {
      debug('onReject', arguments);
    };

    if (typeof resolver === "function") {
      resolver(onFullfilled, onReject);
    }

    var p = {};

    p.then = function (fn) {
      debug('then', fn);

      return new VPromise(fn);
    };

    p.catch = function (fn) {
    };

    return p;
  };

  if (typeof module != 'undefined') {
    module.exports = vPromise;
  }
}());
