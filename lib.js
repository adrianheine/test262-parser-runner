"use strict";

const utils = require("./utils");

module.exports = (testDir, parse, shouldSkip) => {
  return utils.getTests(testDir, shouldSkip).then(function(tests) {
    const total = tests.length;
    const reportInc = Math.floor(total / 20);

    console.log(`Now running ${total} tests...`);

    const results = tests.map(function(test, idx) {
      if (idx % reportInc === 0) {
        console.log(`> ${Math.round(100 * idx / total)}% complete`);
      }

      return utils.runTest(test, parse);
    });

    return results
  })
}
