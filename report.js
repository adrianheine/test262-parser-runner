"use strict";

const chalk = require("chalk");

const interpret = function(results, whitelist) {
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

module.exports = (results, whitelist) => {
  const summary = interpret(results, whitelist);
  const goodnews = [
    summary.allowed.success.length + " valid programs parsed without error",
    summary.allowed.failure.length +
      " invalid programs produced a parsing error",
    summary.allowed.falsePositive.length +
      " invalid programs did not produce a parsing error" +
      " (and allowed by the whitelist file)",
    summary.allowed.falseNegative.length +
      " valid programs produced a parsing error" +
      " (and allowed by the whitelist file)",
    summary.skipped.length +
      " programs were skipped"
  ];
  const badnews = [];
  const badnewsDetails = [];

  void [
    {
      tests: summary.disallowed.success,
      label:
        "valid programs parsed without error" +
        " (in violation of the whitelist file)",
    },
    {
      tests: summary.disallowed.failure,
      label:
        "invalid programs produced a parsing error" +
        " (in violation of the whitelist file)",
    },
    {
      tests: summary.disallowed.falsePositive,
      label:
        "invalid programs did not produce a parsing error" +
        " (without a corresponding entry in the whitelist file)",
    },
    {
      tests: summary.disallowed.falseNegative,
      label:
        "valid programs produced a parsing error" +
        " (without a corresponding entry in the whitelist file)",
    },
    {
      tests: summary.unrecognized,
      label: "non-existent programs specified in the whitelist file",
    },
  ].forEach(function({ tests, label }) {
    if (!tests.length) {
      return;
    }

    const desc = tests.length + " " + label;

    badnews.push(desc);
    badnewsDetails.push(desc + ":");
    badnewsDetails.push(
      ...tests.map(function(test) {
        return (test.file + ' (' + test.scenario + ')') || test
      })
    );
  });

  console.log("Testing complete.");
  console.log("Summary:");
  console.log(chalk.green(goodnews.join("\n").replace(/^/gm, " ✔ ")));

  if (!summary.passed) {
    console.log("");
    console.log(chalk.red(badnews.join("\n").replace(/^/gm, " ✘ ")));
    console.log("");
    console.log("Details:");
    console.log(badnewsDetails.join("\n").replace(/^/gm, "   "));
  }

  process.exitCode = summary.passed ? 0 : 1;
}
