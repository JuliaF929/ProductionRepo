const { readFileSync } = require('fs');
const path = require('path');

const pkg = JSON.parse(
  readFileSync(path.join(__dirname, 'package.json'), 'utf8')
);

function getServerVersion() {
  return process.env.CALIBRIX_SERVER_VERSION || pkg.version;
}

module.exports = { getServerVersion };
