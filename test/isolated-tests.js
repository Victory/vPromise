var vPromise = require('../vPromise.js');
var assert = require('chai').assert;

describe("Chain is run on new promise", function () {
  it("Will run all non-rejected in a row", function (done) {
    var timesRun = 0;
    var finalRun = false;
    new vPromise(function (resolve) {
      resolve(1);
    }).then(function () {
      timesRun += 1;
    }).then(function () {
      timesRun += 1;
    }).then(function () {
      assert.equal(timesRun, 2, "Run twice");
      finalRun = true;
    });
    setTimeout(function () {
      assert.isOk(finalRun, "Last chain ran");
      done();
    }, 50);
  });

  it("Will pass along resolve value", function (done) {
    new vPromise(function (resolve) {
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

  it("Will call fulfilled even if thrown", function (done) {
    var resolve;
    var vP = new vPromise(function (_resolve) {
      resolve = _resolve;
    });

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
     resolve(0);
    }, 50);
  });

  it("Simple throw should still continue", function (done) {
    var resolve;
    var vP = new vPromise(function (_resolve) {
      resolve = _resolve;
    });

    vP.then(function () {
      throw 1;
    });

    vP.then(function () {
      done();
    });

    setTimeout(function () {
      resolve(0);
    }, 50);
  });
});

describe("vPromise.all", function () {
  var sentinel = {sentinel: 'sentinel'};

  this.timeout(1000);

  function threeAlreadyResolvedPromises() {
    var p1 = vPromise.resolve(1);
    var p2 = vPromise.resolve(2);
    var p3 = vPromise.resolve(3);
    return [p1, p2, p3];
  }

  function threeEventuallyResolvedPromises() {
    var p1 = vPromise.resolve(1);
    var p2 = new vPromise(function (resolve) {
      setTimeout(function () { resolve(2); }, 50);
    });
    var p3 = vPromise.resolve(3);
    return [p1, p2, p3];
  }

  function threeOneThrowsPromises() {
    var p1 = vPromise.resolve(1);
    var p2 = new vPromise(function () {
      throw "thrown";
    });
    var p3 = vPromise.resolve(3);
    return [p1, p2, p3];
  }

  function threeOneRejectPromises(reason) {
    var reject;
    var p1 = vPromise.resolve(1);
    var p2 = new vPromise(function(resolve, _reject) {
      reject = _reject;
    });

    var p3 = vPromise.resolve(3);

    setTimeout(function () {
      return reject(reason);
    }, 50);
    return [p1, p2, p3];
  }

  function mdnThree() {
    var p1 = vPromise.resolve(3);
    var p2 = 1337;
    var p3 = new vPromise(function(resolve, reject) {
      setTimeout(resolve, 100, "foo");
    });

    return [p1, p2, p3];
  }

  it("Should return an thenable", function () {
    var args = threeAlreadyResolvedPromises();

    assert(vPromise.all(args) instanceof vPromise);
  });

  it("Should call resolve when all 3 are already resolved", function (done) {
    var args = threeAlreadyResolvedPromises();
    vPromise.all(args).then(function () {
      assert(true);
      done();
    });
  });

  it("Should call resolve when all 3 are eventually resolved", function (done) {
    var args = threeEventuallyResolvedPromises();
    vPromise.all(args).then(function () {
      assert(true);
      done();
    });
  });


  it("Should call reject when one throws", function (done) {
    var args = threeOneThrowsPromises();
    vPromise.all(args).then(function () {
      assert(false);
    }, function () {
      assert(true);
      done();
    });
  });

  it("Should call reject when one rejects", function (done) {
    var args = threeOneRejectPromises(sentinel);

    vPromise.all(args).then(function () {
      assert(false);
    }, function (reason) {
      assert.strictEqual(reason, sentinel);
      done();
    });
  });

  it("Should call resolve with values when all 3 are eventually resolved", function (done) {
    var args = threeEventuallyResolvedPromises();
    vPromise.all(args).then(function (x) {
      assert(x[0] === 1);
      assert(x[1] === 2);
      assert(x[2] === 3);
      done();
    });
  });

  it("Should call resolve with values when all 3 are eventually resolved on the MDN 3", function (done) {
    var args = mdnThree();
    vPromise.all(args).then(function (x) {
      assert(x[0] === 3);
      assert(x[1] === 1337);
      assert(x[2] === "foo");
      done();
    });
  });
});


describe("vPromise.race", function () {

  /**
   * Simple timeout functions
   * @param t1 - timeout of p1
   * @param t2 - timeout of p2
   */
  function simpleTwoTimeouts(t1, t2) {
    var p1 = new vPromise(function (resolve, reject) {
      setTimeout(resolve, t1, "foo");
    });

    var p2 = new vPromise(function (resolve, reject) {
      setTimeout(resolve, t2, "bar");
    });

    return [p1, p2];
  };

  /**
   * Simple timeout functions second 1 rejects
   * @param t1 - timeout of p1
   * @param t2 - timeout of p2 (rejects)
   */
  function simpleTwoWithReject(t1, t2) {
    var p1 = new vPromise(function (resolve, reject) {
      setTimeout(resolve, t1, "foo");
    });

    var p2 = new vPromise(function (resolve, reject) {
      setTimeout(reject, t2, "bar");
    });

    return [p1, p2];
  };

  it("Should resolve fastest first, first promise", function (done) {
    vPromise.race(simpleTwoTimeouts(50, 100)).then(function (x) {
      assert(x == "foo");
      done();
    });
  });

  it("Should resolve fastest first, second promise", function (done) {
    vPromise.race(simpleTwoTimeouts(100, 50)).then(function (x) {
      assert(x == "bar");
      done();
    });
  });

  it("Should resolve with faster resolve", function (done) {
    vPromise.race(simpleTwoWithReject(50, 100)).then(function (x) {
      assert(x == "foo");
      done();
    });
  });

  it("Should reject with faster resolve", function (done) {
    vPromise.race(simpleTwoWithReject(100, 50)).then(function (x) {
      assert(false);
    }, function (x) {
      assert (x == "bar");
      done();
    });
  });
});
