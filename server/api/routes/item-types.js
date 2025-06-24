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

router.get('/', async (req, res) => {
  try {
    const rows = await sheets.getAllRows(constants.ITEM_TYPES_SPREADSHEET_ID, 
                                  constants.ITEM_TYPES_SHEET_NAME, 
                                  'D');
    const itemTypes = rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      SNPrefix: row[3],
    }));

    res.status(200).json(itemTypes);

    logger.debug(`Returned 200 response with all existing item types (count: ${itemTypes.length}).`);
    return; 
  }
   catch (error)
  {
    logger.debug(`Failed to get all item types: ${error}`);
    res.status(500).json({ message: 'Failed to get all item types.' });
  }
});


router.delete('/:uuid', async (req, res) => {

  const sheetId = await sheets.getSheetIdByName(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME);
  if (sheetId === null) {
    logger.error(`Sheet with name ${constants.ITEM_TYPES_SPREADSHEET_ID} not found.`);
    return res.status(400).json({ message: 'Sheet not found' });
  }

  const uuid = req.params.uuid;
  
  try {
    const deleteResult = await sheets.deleteRowByUUID(constants.ITEM_TYPES_SPREADSHEET_ID, 
                                               constants.ITEM_TYPES_SHEET_NAME, 
                                               sheetId,
                                               'D',
                                               uuid);      

    if (deleteResult === false  ) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });

  } catch (error) {
    logger.debug(`Failed to delete item type with uuid: ${uuid}:`, error);
    res.status(500).json({ message: 'Failed to delete item type' });
  }
});



module.exports = router;