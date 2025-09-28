const express = require('express');
const { HTTP_STATUS, STRING_CONSTANTS } = require('../../../shared/constants');
const router = express.Router();
const logger = require('../../logger');

const Item = require('../models/items');

// Later can swap this line to use a MongoDB or another repository
const itemTypeRepository = require('../../repositories/sheets/itemTypeRepositorySheets');
const parameterDefaultRepository = require('../../repositories/sheets/parameterDefaultRepositorySheets');
const itemRepository = require('../../repositories/mongodb/itemRepositoryMongo');

router.get('/', async (req, res, next) => {
    logger.debug(`Start getting all items (narrow)`);
    try 
    {
        const docs = await itemRepository.getAllNarrowItems();
        res.status(HTTP_STATUS.OK).json(docs);
    } 
    catch (err) 
    {
        logger.error(`Exception during getting all items: ${err}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    }
});

router.post('/', async (req, res, next) => {

    logger.debug(`FULL BODY: ${JSON.stringify(req.body, null, 2)}`);
    logger.debug(`req.body.SerialNumber is ${req.body.SerialNumber}, req.body.Type is ${req.body.Type}`);
    //0. validate that item with the same serial number does not already exist
    const existingItem = await itemRepository.itemExists(req.body.SerialNumber);

    if (existingItem) {
      // Duplicate found, abort
      logger.debug(`Item with this SerialNumber ${req.body.SerialNumber} already exists.`);
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`Item with Serial Number '${req.body.SerialNumber}' already exists.`);
    }

    
    //1. get all default parameters for item type
    let parameterDefaults;
    const start1 = Date.now();
    try
    {
        //get itemTypeID from item Type Name
        //if we have (shall not accept) several equal item types names, we will get the first match
        const itemTypeID = await itemTypeRepository.getFirstItemTypeIDForItemTypeName(req.body.Type); 
        if (itemTypeID === null)
        {
            logger.debug(`GET parameter defaults for item type name ${req.body.Type}, got null from getFirstItemTypeIDForItemTypeName`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all parameter defaults for item type name.'});
        }

        logger.debug(`Got item type ID ${itemTypeID} for the item type name ${req.body.Type}`);
  
        parameterDefaults = await parameterDefaultRepository.getAllParameterDefaultsForItemType(itemTypeID);

        logger.debug(`Returned parameter defaults for item type ID ${itemTypeID} - ${JSON.stringify(parameterDefaults, null, 2)}`);
    }
    catch (error)
    {
      logger.debug(`Failed to get all parameter defaults for itemTypeName: ${req.body.Type}, error: ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all parameter defaults for item type name, exception.' });
    }
    const getParamDefActionMs = Date.now() - start1;
    logger.debug(`getParamDefActionMs for mongo save: ${getParamDefActionMs} ms`)

    //2. save an item
    logger.debug(`POST - going to save an item : ${req.body.SerialNumber}, type name ${req.body.Type}`);

    const parametersWithValues = parameterDefaults.map(p => ({
        name: p.name,
        description: p.description,
        type: p.type,
        defaultValue: p.defaultValue,
        value: p.defaultValue 
      }));

    //on new item creation there is still no calib applications passed, so calibApps array is empty

    const item = new Item({
        serialNumber: req.body.SerialNumber,
        type: req.body.Type,
        creationdate: new Date().toLocaleString(),
        releasedate: "",
        parameters: parametersWithValues
    });

    const start2 = Date.now();
    try {
        const result = await itemRepository.addItem(item);
        const saveActionMs = Date.now() - start2;
        logger.debug(`saveActionMs for mongo save: ${saveActionMs} ms`)
        logger.debug(`Item with SerialNumber ${req.body.SerialNumber} saved with result ${result}`);

        res.status(HTTP_STATUS.CREATED).json({
            message: "Handling POST requests to /items",
            createdItem: item
        });
    } catch (err) {
        logger.debug(`Exception during saving item with SerialNumber ${req.body.SerialNumber}: ${err}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
    
});

router.get('/:itemSN', async (req, res, next) => {

    logger.debug(`Start getting all parameters for itemSN: ${req.params.itemSN}`);

    try 
    {
        const docs = await itemRepository.getParametersForItem(req.params.itemSN);
        logger.debug(`Got parameters for itemSN ${req.params.itemSN} - ${JSON.stringify(docs, null, 2)}`);
        res.status(HTTP_STATUS.OK).json(docs);
    } 
    catch (err) 
    {
        logger.error(`Exception during getting parameters for itemSN ${req.params.itemSN}: ${err}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    }
});

module.exports = router;