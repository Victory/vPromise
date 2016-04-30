var vPromise = require('../vPromise.js');
var assert = require('chai').assert;

describe("Chan is run on new promise", function () {
  /*
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

  it("Will pass along rejected even if thrown", function (done) {

    var sentinel = {s1: "s1"};
    var sentinel2 = {s2: "s2"};
    var sentinel3 = {s3: "s3"};

    var numTimesCalled = 0;
    var promise = vPromise.reject(sentinel);

    promise.then(null, function () {
      return sentinel;
    }).then(function (value) {
      assert.strictEqual(value, sentinel);
      numTimesCalled += 1;
    });

    promise.then(null, function () {
      throw sentinel2;
    }).then(null, function (reason) {
      assert.strictEqual(reason, sentinel2);
      numTimesCalled += 1;
    });

    promise.then(null, function () {
      return sentinel3;
    }).then(function (value) {
      assert.strictEqual(value, sentinel3);
      numTimesCalled += 1;
    });

    setTimeout(function () {
      assert.equal(numTimesCalled, 3, "Did not call 3 times");
      done();
    }, 500);
  });

  it("Will then will call unfilfulled even if promise that made it is rejected", function (done) {

    var sentinel = {s1: "s1"};
    var promise = vPromise.reject(sentinel);

    var okPromise = promise.then(null, function () {
      return sentinel;
    });

    okPromise.then(function (value) {
      assert.strictEqual(value, sentinel);
      done();
    });
  });

  it("Simple throw should still continue", function (done) {
    var vP = new vPromise();

    vP.then(function () {
      throw 1;
    });

    vP.then(function () {
      done();
    });

    setTimeout(function () {
     vP.resolve(0);
    }, 50);
  });
  */

  it("Will call fulfilled even if thrown", function (done) {
    var vP = new vPromise();

    vP.then(function () {
      return 1;
    });
    vP.then(function () {
      throw 2;
    });
    vP.then(function () {
      return 3;
    });

    vP.then(function () {
      done();
    });

    setTimeout(function () {
     vP.resolve(0);
    }, 50);
  });

});
