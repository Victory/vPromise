var vPromise = require('../vPromise.js');
var adapter = {
  resolved: vPromise.resolve,
  rejected: vPromise.reject,
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
module.exports = adapter;