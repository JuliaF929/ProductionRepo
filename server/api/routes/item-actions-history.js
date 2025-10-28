const express = require('express');
const router = express.Router();
const logger = require('../../logger');
const awsService = require('../services/awsService');
const { format } = require('date-fns');
const { HTTP_STATUS } = require('../../../shared/constants');

const ItemAction = require('../models/item-actions');

const itemActionsHistoryRepository = require('../../repositories/mongodb/itemActionHistoryRepositoryMongo');

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
              runStartdate: req.body.runStartdate,
              runStopdate: req.body.runStopdate,
              result: req.body.result,
              errorMsg: req.body.errorMsg,
              stationName: req.body.stationName,
              siteName: req.body.siteName,
              operatorName: req.body.operatorName,
              parameters: req.body.parameters //embedded array of params
    });
   
    try {
           
        const result = await itemActionsHistoryRepository.addItemAction(itemAction);
        logger.debug(`Item Action ${req.body.actionName} for item SN ${req.body.itemSerialNumber} saved with result ${result}`);
   
        res.status(HTTP_STATUS.CREATED).json({
               message: "Handling POST requests to /items-actions-history",
           });
       } catch (err) {
           logger.debug(`Exception during saving item action ${req.body.actionName} for item SN ${req.body.itemSerialNumber}: ${err}`);
           res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
               error: err
           });
       }

});

module.exports = router;