const express = require('express');
const router = express.Router();
const logger = require('../../logger');

const ItemType = require('../models/item-types');

// Later can swap this line to use a MongoDB or another repository
const itemTypeRepository = require('../../repositories/sheets/itemTypeRepositorySheets');
const itemTypeAtomicTransaction = require('../../repositories/sheets/itemTypeAtomicTransactionsSheets');
const testApplicationRepository = require('../../repositories/sheets/testApplicationRepositorySheets');

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

    // Map over parameterDefaults and assign new uuidv4 to _id
    const parameterDefaultsWithUUID = (req.body.parameterDefaults || []).map(param => ({
      ...param,
      _id: uuidv4()
    }));

    logger.debug(`Received parameters: ${JSON.stringify(parameterDefaultsWithUUID, null, 2)}`); 
    logger.debug(`Received test applications: ${JSON.stringify(req.body.testApplications, null, 2)}`);

    //translate testApplications to testApplicationsWithUUID
    const allExistingTestApplications = await testApplicationRepository.getAllTestApplications();
    const testApplicationsForItemTypeUUIDs = (req.body.testApplications || []).map(app => {
      const matchingApp = allExistingTestApplications.find(existingApp => existingApp.name === app.selectedAppName && existingApp.versionNumber === app.selectedAppVersion);
      logger.debug(`Matching app: ${JSON.stringify(matchingApp, null, 2)}`);
      return matchingApp ? matchingApp._id : null;
    });

    logger.debug(`Received test applications UUIDs: ${JSON.stringify(testApplicationsForItemTypeUUIDs, null, 2)}`);

    try
     {
        
        await itemTypeAtomicTransaction.addAtomicItemType(itemType, parameterDefaultsWithUUID, testApplicationsForItemTypeUUIDs);

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

    const itemTypes = await itemTypeRepository.getAllItemTypes();
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