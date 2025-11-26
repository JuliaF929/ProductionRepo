const express = require('express');
const router = express.Router();
const logger = require('../../logger');
const awsService = require('../services/awsService');
const { format } = require('date-fns');
const { HTTP_STATUS } = require('../../../shared/constants');
const itemActionService = require('../services/itemActionService');

const ItemAction = require('../models/item-actions');


const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res, next) => {
        
    logger.debug(`POST item action FULL BODY: ${JSON.stringify(req.body, null, 2)}`);
    logger.debug(`req.body.itemSerialNumber is ${req.body.itemSerialNumber}, req.body.itemType is ${req.body.itemType}, req.body.actionName is ${req.body.actionName}`);
    logger.debug(`req.body.parameters is ${JSON.stringify(req.body.parameters, null, 2)}`);

    logger.debug(`POST - going to save item action: item SN: ${req.body.itemSerialNumber}, item type ${req.body.itemType}, action name ${req.body.actionName}`);
 
    const itemAction = new ItemAction({
              itemSerialNumber: req.body.itemSerialNumber,
              itemType: req.body.itemType,
              actionName: req.body.actionName,
              actionSWVersion: req.body.actionSWVersion,
              calibrixOperatorAppSWVersion: req.body.calibrixOperatorAppSWVersion,
              startExecutionDateTimeUTC: req.body.startExecutionDateTimeUTC,
              endExecutionDateTimeUTC: req.body.endExecutionDateTimeUTC,
              result: req.body.result,
              errorMsg: req.body.errorMsg,
              stationName: req.body.stationName,
              siteName: req.body.siteName,
              operatorName: req.body.operatorName,
              parameters: req.body.parameters //embedded array of params
    });
   
    try {
        //TODO: think how to upload a report and save item action at the same transaction

        uploadResult = await awsService.uploadReport(req.body.itemType, 
                                                     req.body.itemSerialNumber, 
                                                     req.body.actionName, 
                                                     req.body.actionSWVersion, 
                                                     req.body.endExecutionDateTimeUTC, 
                                                     Buffer.from(req.body.reportStream, 'base64'));
        if (uploadResult !== "") {
            logger.debug(`Failed to upload report for item SN ${req.body.itemSerialNumber}, action ${req.body.actionName}, version ${req.body.actionSWVersion} at ${req.body.endExecutionDateTimeUTC}: ${uploadResult}`);
            return res.status(500).json({ 
                success: false, 
                message: `Failed to upload report: ${uploadResult}` 
            });
        }

        logger.debug(`Report saved for item ${req.body.itemSerialNumber}, action ${req.body.actionName}, version ${req.body.actionSWVersion} at ${req.body.endExecutionDateTimeUTC}`);
   
        const saveResult = await itemActionService.saveActionAndUpdateParams(itemAction);
        if (saveResult?.ok) {
            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "Item Action created successfully.",
            });
        }     
        return res.status(500).json({ 
            success: false, 
            message: "Unknown failure during item action creation." 
        });
       } catch (err) {
           logger.debug(`Exception during saving item action ${req.body.actionName} for item SN ${req.body.itemSerialNumber}: ${err}`);
           return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
               message: err
           });
       }

       //const reportBuffer = Buffer.from(req.body.reportStream, 'base64');
       

});

router.post('/download-link-report', async (req, res, next) => {
    const itemSN = req.body.itemSN;
    const itemType = req.body.itemType;
    const actionName = req.body.actionName;
    const actionSWVersion = req.body.actionSWVersion;
    const endExecutionDateTimeUTC = req.body.endExecutionDateTimeUTC;
  
    logger.debug(`GET download link for report of itemType=${itemType}, itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC} started`);
  
    try
    {
      const downloadSetup = await awsService.getReportDownloadSetup(itemType, itemSN, actionName, actionSWVersion, endExecutionDateTimeUTC);
      logger.debug(`Got download setup for report of itemType=${itemType}, itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC} - url: ${downloadSetup.url}, fileName: ${downloadSetup.fileName}`); 
      res.json(downloadSetup); // Client will use this setup to download the report
    }
    catch (error)
    {
      let errorStr = `Failed to get download link for of itemType=${itemType}, itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC}`;
      logger.debug(`${errorStr}, Error - ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
    }
});

router.post('/report-name', async (req, res, next) => {
    logger.debug(`FULL BODY: ${JSON.stringify(req.body, null, 2)}`);

    const itemSN = req.body.itemSN;
    const actionName = req.body.actionName;
    const actionSWVersion = req.body.actionSWVersion;
    const endExecutionDateTimeUTC = req.body.endExecutionDateTimeUTC;
  
    logger.debug(`GET report name for itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC} started`);
  
    try
    {
      const reportFileName = await awsService.getReportFileName(itemSN, actionName, actionSWVersion, endExecutionDateTimeUTC);
      logger.debug(`Got report name for itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC} - fileName: ${reportFileName}`); 
      res.json(reportFileName); // Client will use this reportFileName to create a report for new action
    }
    catch (error)
    {
      let errorStr = `Failed to get report name for itemSN=${itemSN}, actionName=${actionName}, actionSWVersion=${actionSWVersion}, endExecutionDateTimeUTC=${endExecutionDateTimeUTC}`;
      logger.debug(`${errorStr}, Error - ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
    }
});

module.exports = router;