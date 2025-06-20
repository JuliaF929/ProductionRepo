const express = require('express');
const constants = require('../../../shared/constants');
const router = express.Router();
//const mongoose = require('mongoose');
const logger = require('../../logger');
const sheets = require('../../sheets')

const ItemType = require('../models/item-types');

router.post('/', async (req, res, next) => {
 
    const itemType = new ItemType({
        _id: "ItemTypeXID",//new mongoose.Types.ObjectId(),
        name: req.body.name

    });

    // Just log the itemType instead of saving
    logger.debug("Received item type: " + itemType.name);

    try
     {
        await sheets.appendRow(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME, [itemType.name]);
        res.send('Row added successfully');
        return; 
      } catch (error) {
        console.error(error);
        res.status(500).send('Error adding row');
      }

    res.status(201).json({
        message: "Simulated handling of POST request to /item-types",
        receivedItemType: itemType.name
    });

    // itemType.save().then(result => {
    //     logger.debug(result);

    //     res.status(HTTP_STATUS.CREATED).json({
    //         message: "Handling POST requests to /item-types",
    //         createdItemType: itemType
    //     });
    // }).catch(err =>{
    //     logger.debug(err);
    //     res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    //         error: err
    //     });
    //})
    
});


module.exports = router;