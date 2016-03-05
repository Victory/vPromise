var vPromise = require('../vPromise.js');
var adapter = {
  resolved: function (value) {
    return new vPromise(value);
  },
  rejected: function (reason) {
    return new vPromise(reason);
  },
  deferred: function () {
  }
};

describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(adapter);
});

