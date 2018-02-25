"use strict";

const TestStream = require('test262-stream');

const runTest = function(test, parse) {
  const sourceType = test.attrs.flags.module ? "module" : "script";

  test.expectedError = test.attrs.negative && (test.attrs.negative.phase === "parse" || test.attrs.negative.phase === "early")
  try {
    parse(test.contents, { sourceType });
    test.actualError = false;
  } catch (err) {
    test.actualError = true;
  }

  return test;
};

module.exports = (testDir, parse, shouldSkip) => {
  const stream = new TestStream(testDir, { omitRuntime: true });

  const results = [];
  stream.on('data', test => {
    if (shouldSkip(test)) {
      results.push({skip: true});
    } else {
      test.file = test.file.substr(5); // Strip leading 'test/'
      results.push(runTest(test, parse));
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(results));
    stream.on('error', reject);
  });
}
