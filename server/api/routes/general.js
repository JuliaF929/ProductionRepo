const express = require('express');
const router = express.Router();
const { getServerVersion } = require('../../version.js');
const logger = require('../../logger');
const awsService = require('../services/awsService');


router.get('/download-operator-app-win', async (req, res) => {
  logger.debug('GET download operator app for Windows.');

  let serverVersion = getServerVersion();

  logger.debug(`Going to get a download link for OperatorApp for Windows, ver# ${serverVersion}.`);

  try
  {
    const downloadSetup = await awsService.getOperatorAppWinDownloadSetup(serverVersion);
    logger.debug(`Got download setup for OperatorApp for Windows - url: ${downloadSetup.url}, fileName: ${downloadSetup.fileName}`); 
    res.json(downloadSetup); // Client will use this setup to download the OperatorApp for Windows
  }
  catch (error)
  {
    let errorStr = `Failed to get download link for OperatorApp for Windows, ver# ${serverVersion}.`;
    logger.debug(`${errorStr}, Error - ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
  }

});

module.exports = router;