# vPromise
A Promise Polyfill with an Apache 2.0 License.

<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant" align="right" />
</a>

Current results of the Promises/A+ Test Suite.
[![Build Status](https://travis-ci.org/Victory/vPromise.svg?branch=master)](https://travis-ci.org/Victory/vPromise)

Install:
  `npm install vPromise`

## Usage:

    const vPromise = require('vPromise');

    var vp = new vPromise(function (resolve) {
       resolve('some val');
    }).then(function(result) {
       console.log(result);
    });`

### Todo
 - Try to hide some book keeping
