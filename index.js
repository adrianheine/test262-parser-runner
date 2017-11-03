const path = require("path")

const run = require("./lib")

const testDir = path.join(path.dirname(require.resolve("test262/package.json")), "test")
module.exports = (parse, shouldSkip = () => false, whitelist = {}) => {
  run(testDir, parse, shouldSkip, whitelist)
};
