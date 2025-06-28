const express = require('express');
const router = express.Router();
const logger = require('../../logger');

const ItemType = require('../models/item-types');

// Later can swap this line to use a MongoDB or another repository
const itemTypeRepository = require('../../repositories/itemTypeRepositorySheets');

const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res, next) => {
 
    const itemType = new ItemType({
        _id: uuidv4(),
        name: req.body.name,
        description: req.body.description,
        SNPrefix: req.body.SNPrefix
    });

    // Just log the itemType 
    logger.debug(`Received item type: ${itemType.name}, ${itemType.description}, ${itemType.SNPrefix}`);

    //null - No replacer function
    //Pretty-print with 2 spaces
    logger.debug(`Received parameters: ${JSON.stringify(req.body.parameterDefaults, null, 2)}`); 

    try
     {
        await itemTypeRepository.addItemType(itemType);

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

    const rows = await itemTypeRepository.getAllItemTypes();
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

  const uuid = req.params.uuid;
  
  try {

    const deleteResult = await itemTypeRepository.deleteItemTypeByUUID(req.params.uuid);

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