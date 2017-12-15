"use strict";

const path = require("path")

const run = require("./lib")
const report = require("./report")

module.exports = (parse, {
    testsDirectory = path.dirname(require.resolve("test262/package.json")),
    skip = () => false,
    whitelist = []
  } = {}) => run(testsDirectory, parse, skip).then(results => report(results, whitelist));
