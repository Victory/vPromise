var vPromise = require('../vPromise.js');
var assert = require('chai').assert;

describe("Chan is run on new promise", function () {
  it("Will run all non-rejected in a row", function (done) {
    var timesRun = 0;
    var finalRun = false;
    var vP = new vPromise(function (resolve, reject) {
      resolve(1);
    }).then(function () {
      timesRun += 1;
    }).then(function () {
      timesRun += 1;
    }).then(function (val) {
      assert.equal(timesRun, 2, "Run twice");
      finalRun = true;
    });
    setTimeout(function () {
      assert.isOk(finalRun, "Last chain ran");
      done();
    }, 50);
  });

  it("Will pass along resolve value", function (done) {
    var vP = new vPromise(function (resolve, reject) {
      resolve(1);
    }).then(function (val) {
      assert.equal(val, 1, "val for first then must be 1");
      return 2;
    }).then(function (val) {
      assert.equal(val, 2, "val for second then must be 2");
      done();
    });
  });
});
