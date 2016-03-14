const adapter = require('./adapter.js');

describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(adapter);
});

