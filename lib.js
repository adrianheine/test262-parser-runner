"use strict";

const TestStream = require('test262-stream');

const endOfAssertJs = "assert.throws(err, function() { Function(wrappedCode); }, 'Function: ' + code);\n};"
const useStrict = '"use strict";\n';

const runTest = function(test, parse) {
  const sourceType = test.attrs.flags.module ? "module" : "script";

  test.expectedError = test.attrs.negative && test.attrs.negative.phase === "early"
  try {
    parse(test.contents, { sourceType });
    test.actualError = false;
  } catch (err) {
    test.actualError = true;
  }

  return test;
};

module.exports = (testDir, parse, shouldSkip) => {
  const stream = new TestStream(testDir);

  const results = [];
  stream.on('data', test => {
    if (shouldSkip(test)) {
      results.push({skip: true});
    } else {
      test.file = test.file.substr(5); // Strip leading 'test/'
      if (!test.attrs.flags.raw) {
        // Strip helpers, but keep strict directive if present
        const m = test.contents.indexOf(endOfAssertJs) + endOfAssertJs.length
        test.contents = (test.contents.substr(0, useStrict.length) === useStrict ? useStrict : '') + test.contents.substr(m)
      }
      results.push(runTest(test, parse));
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(results));
    stream.on('error', reject);
  });
}
