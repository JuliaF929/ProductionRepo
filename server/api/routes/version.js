const express = require('express');
const router = express.Router();
const { getServerVersion } = require('../../version.js');
const logger = require('../../logger');


router.get('/', (_req, res) => {
  logger.debug(`GET server version, returning ${getServerVersion()}.`);

  res.json({
    serverVersion: getServerVersion(),
  });
});

module.exports = router;