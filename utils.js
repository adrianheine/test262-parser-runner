"use strict";

const hasFlag = (test, flag) => test.attrs.flags[flag] || false

exports.runTest = function(test, parse) {
  const sourceType = hasFlag(test, "module") ? "module" : "script";

  test.expectedError = test.attrs.negative && test.attrs.negative.phase === "early"
  try {
    parse(test.contents, { sourceType });
    test.actualError = false;
  } catch (err) {
    test.actualError = true;
  }

  return test;
};

exports.interpret = function(results, whitelist) {
  whitelist = whitelist.reduce((res, v) => {
    res[v] = true
    return res
  }, {})
  const summary = {
    passed: true,
    allowed: {
      success: [],
      failure: [],
      falsePositive: [],
      falseNegative: [],
    },
    disallowed: {
      success: [],
      failure: [],
      falsePositive: [],
      falseNegative: [],
    },
    unrecognized: null,
    skipped: []
  };

  results.forEach(function(result) {
    let classification, isAllowed;
    const desc = result.file + ' (' + result.scenario + ')';
    const inWhitelist = desc in whitelist;
    delete whitelist[desc];

    if (result.skip) {
      summary.skipped.push(result)
      return
    } else if (!result.expectedError) {
      if (!result.actualError) {
        classification = "success";
        isAllowed = !inWhitelist;
      } else {
        classification = "falseNegative";
        isAllowed = inWhitelist;
      }
    } else {
      if (!result.actualError) {
        classification = "falsePositive";
        isAllowed = inWhitelist;
      } else {
        classification = "failure";
        isAllowed = !inWhitelist;
      }
    }

    summary.passed &= isAllowed;
    summary[isAllowed ? "allowed" : "disallowed"][classification].push(result);
  });

  summary.unrecognized = Object.keys(whitelist);
  summary.passed = !!summary.passed && summary.unrecognized.length === 0;

  return summary;
};
