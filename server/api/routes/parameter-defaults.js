const express = require('express');
const router = express.Router();
const logger = require('../../logger');

const ParameterDefault = require('../models/parameter-defaults');

// Later can swap this line to use a MongoDB or another repository
const parameterDefaultRepository = require('../../repositories/parameterDefaultRepositorySheets');

const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res, next) => {
 
    const parameterDefault = new ParameterDefault({
        _id: uuidv4(),
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        defaultValue: req.body.defaultValue,
        itemTypeID: req.body.itemTypeID
    });

    logger.debug(`Received parameter default, \
                  name:${parameterDefault.name}, \
                  description: ${parameterDefault.description}, \
                  type: ${parameterDefault.type}, \
                  defaultValue: ${parameterDefault.defaultValue}\
                  for itemTypeID: ${parameterDefault.itemTypeID}`);
 
    try
     {
        await parameterDefaultRepository.addParameterDefault(parameterDefault);

        res.status(201).json({
          message: 'Row added successfully',
          receivedParameterDefaultName: parameterDefault.name,
        });
        logger.debug(`Row added successfully for parameter default, \
                      name:${parameterDefault.name}, \
                      description: ${parameterDefault.description}, \
                      type: ${parameterDefault.type}, \
                      defaultValue: ${parameterDefault.defaultValue}\
                      for itemTypeID: ${parameterDefault.itemTypeID}`);
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

    const rows = await parameterDefaultRepository.getAllParameterDefaults();
    const parameterDefaults = rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemType: row[5]
    }));

    res.status(200).json(parameterDefaults);

    logger.debug(`Returned 200 response with all existing parameter defaults (count: ${parameterDefaults.length}).`);
    return; 
  }
   catch (error)
  {
    logger.debug(`Failed to get all parameter defaults: ${error}`);
    res.status(500).json({ message: 'Failed to get all parameter defaults.' });
  }
});

router.get('/:itemTypeID', async (req, res) => {
    try {

      const itemTypeID = req.params.itemTypeID;
  
      const rows = await parameterDefaultRepository.getAllParameterDefaultsForItemType(itemTypeID);
      const parameterDefaults = rows.map(row => ({
        uuid: row[0],
        name: row[1],
        description: row[2],
        type: row[3],
        defaultValue: row[4],
        itemType: row[5]
      }));
  
      res.status(200).json(parameterDefaults);
  
      logger.debug(`Returned 200 response with all existing parameter defaults for itemTypeID: ${req.params.itemTypeID}, (count: ${parameterDefaults.length}).`);
      return; 
    }
    catch (error)
    {
      logger.debug(`Failed to get all parameter defaults for itemTypeID:${itemTypeID}, error: ${error}`);
      res.status(500).json({ message: 'Failed to get all parameter defaults for itemTypeID.' });
    }
  });


router.delete('/:uuid', async (req, res) => {

  const uuid = req.params.uuid;
  
  try {

    const deleteResult = await parameterDefaultRepository.deleteParameterDefaultByUUID(req.params.uuid);

    if (deleteResult === false  ) {
      return res.status(404).json({ message: 'Parameter default not found' });
    }

    res.status(200).json({ message: 'Parameter default deleted successfully' });

  } catch (error) {
    logger.debug(`Failed to delete parameter default with uuid: ${uuid}:, error: ${error}`);
    res.status(500).json({ message: 'Failed to delete parameter default' });
  }
});



module.exports = router;