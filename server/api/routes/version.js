const express = require('express');
const router = express.Router();
const { getServerVersion } = require('../../version.js');


router.get('/', (_req, res) => {
  res.json({
    serverVersion: getServerVersion(),
  });
});

module.exports = router;