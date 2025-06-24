const express = require('express');
const constants = require('../../../shared/constants');
const router = express.Router();
//const mongoose = require('mongoose');
const logger = require('../../logger');
const sheets = require('../../sheets')

const ItemType = require('../models/item-types');

const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res, next) => {
 
    const itemType = new ItemType({
        _id: uuidv4(),
        name: req.body.name,
        description: req.body.description,
        SNPrefix: req.body.SNPrefix
    });

    // Just log the itemType instead of saving
    logger.debug("Received item type: " + itemType.name + ' ' + itemType.description + ' ' + itemType.SNPrefix);

    try
     {
        await sheets.appendRow(constants.ITEM_TYPES_SPREADSHEET_ID, 
                               constants.ITEM_TYPES_SHEET_NAME, 
                               [itemType._id, 
                                itemType.name, 
                                itemType.description, 
                                itemType.SNPrefix]);
        res.status(201).json({
          message: 'Row added successfully',
          receivedItemType: itemType.name,
        });
        logger.debug('Row added successfully for item type ' + itemType.name + ' ' + itemType.description + ' ' + itemType.SNPrefix);
        return; 
      } 
      catch (error) 
      {
        logger.debug(error.message);
        res.status(500).json({
          error: 'Error adding row',
          details: error.message,
        });
      }
});


module.exports = router;