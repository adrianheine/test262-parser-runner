# test262-parser-runner

A test runner for running the [ECMAScript Test Suite](https://github.com/tc39/test262) against a given parser.

## Installation

```sh
npm i test262-parser-runner
```

## Usage

The test runner provides two means for marking bad test cases.

First, you can pass a skip filter, which is a function that gets the test case
passed in and returns true if a test should be completely skipped. It is most
useful for filtering out tests that are not supposed to pass, for example
because they test features that are not supposed to be implemented.

Second, there is a whitelist, which is a list of test ids that don't yield the
expected result. It should be used for tests that are supposed to succeed
eventually.

This is a simple example for running the tests against acorn:

```javascript
const run = require("test262-parser-runner")
const parse = require("acorn").parse

run(
  (content, {sourceType}) => parse(content, { sourceType, ecmaVersion: 9 }),
  {
    skip: test => false, // Default is to skip no test
    whitelist: [], // Default is to whitelist no test
    testsDirectory: "/path/to/test262" // Default is to use the bundled version
  }
)
```

## Authors and license

This package is based on a MIT-licensed test runner implemented by Mike Pennisi for the [babel project](https://babeljs.io).

The package itself is released under the GNU Affero General Public License v3.0 by Adrian Heine.
