var vPromise = require('../vPromise.js');
var adapter = {
  resolved: function (value) {
    return vPromise.resovle;
  },
  rejected: function (reason) {
    return vPromise.reject;
  },
  deferred: function () {
    var resolve;
    var reject;
    var vP = new vPromise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise: vP,
      resolve: resolve,
      reject: reject
    };
  }
};

describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(adapter);
});

