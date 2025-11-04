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

});

module.exports = router;