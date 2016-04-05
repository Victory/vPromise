var vPromise = require('../vPromise.js');
var assert = require('chai').assert

describe("Chan is run on new promise", function () {
  it("Will run all non-rejected in a row", function (done) {
    var timesRun = 0;

    var vP = new vPromise(function (resolve, reject) {
      resolve(1);
    }).then(function () {
      timesRun += 1;
    }).then(function () {
      timesRun += 1;
    }).then(function (val) {
      assert(timesRun == 2, "Run twice");
    });
    setTimeout(function () {
      done();
    }, 50);
  });
});
