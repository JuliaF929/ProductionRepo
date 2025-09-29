const express = require('express');
const router = express.Router();
const logger = require('../../logger');
const awsService = require('../../api/services/awsService');
const { format } = require('date-fns');
const { HTTP_STATUS } = require('../../../shared/constants');

const TestApplication = require('../models/test-applications');

// Later can swap this line to use a MongoDB or another repository
const testApplicationRepository = require('../../repositories/sheets/testApplicationRepositorySheets');
const itemTypeRepository = require('../../repositories/sheets/itemTypeRepositorySheets');

const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res, next) => {
 
    const testApplication = new TestApplication({
        _id: uuidv4(),
        name: req.body.name,
        versionNumber: req.body.versionNumber,
        description: req.body.description,
        ECONumber: req.body.ECONumber,
        UploadDate: format(new Date(), 'dd-MMM-yyyy, HH:mm'),
        EffectiveDate: format(new Date(), 'dd-MMM-yyyy, HH:mm'),
        UploadUser: 'TODO: not implemented yet',
        Path: 'TODO: not implemented yet',
        testAppExeName: req.body.testAppExeName
    });

    logger.debug(`Received test application, \
                  name:${testApplication.name}, \
                  versionNumber: ${testApplication.versionNumber}, \
                  description: ${testApplication.description}, \
                  ECONumber: ${testApplication.ECONumber}, \
                  UploadUser: ${testApplication.UploadUser}, \
                  Path: ${testApplication.Path},\
                  testAppExeName: ${testApplication.testAppExeName}`);
 
    try
     {
        await testApplicationRepository.addTestApplication(testApplication);

        res.status(HTTP_STATUS.CREATED).json({
          message: 'Row added successfully',
          receivedTestApplicationName: testApplication.name,
        });
        logger.debug(`Row added successfully for test application, \
                      name:${testApplication.name}, \
                      description: ${testApplication.description}, \
                      ECONumber: ${testApplication.ECONumber}, \
                      UploadDate: ${testApplication.UploadDate}, \
                      EffectiveDate: ${testApplication.EffectiveDate}, \
                      UploadUser: ${testApplication.UploadUser}, \
                      Path: ${testApplication.Path},\
                      testAppExeName: ${testApplication.testAppExeName}`);
        return; 
      } 
      catch (error) 
      {
        logger.debug(error.message);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: 'Error adding row',
          details: error.message,
        });
      }
});

router.get('/', async (req, res) => {
  try {

    const testApplications = await testApplicationRepository.getAllTestApplications();
    res.status(HTTP_STATUS.OK).json(testApplications);

    logger.debug(`Returned ${HTTP_STATUS.OK} response with all existing test applications (count: ${testApplications.length}).`);
    return; 
  }
   catch (error)
  {
    logger.debug(`Failed to get all test applications: ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all test applications.' });
  }
});


router.delete('/:uuid', async (req, res) => {

  const uuid = req.params.uuid;
  
  try {

    const deleteResult = await testApplicationRepository.deleteTestApplicationByUUID(req.params.uuid);

    if (deleteResult === false  ) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Test application not found' });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Test application deleted successfully' });

  } catch (error) {
    logger.debug(`Failed to delete test application with uuid: ${uuid}:, error: ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete test application' });
  }
});

//get all test applications meta data for the given item type
router.get('/:itemTypeName', async (req, res) => {

  logger.debug(`GET all test applications meta data for ${req.params.itemTypeName} started`);
  try
  {
        //get itemTypeID from item Type Name
        //if we have (shall not accept) several equal item types names, we will get the first match
        const itemTypeID = await itemTypeRepository.getFirstItemTypeIDForItemTypeName(req.params.itemTypeName); 
        if (itemTypeID === null)
        {
            logger.debug(`GET test applications for item type name ${req.params.itemTypeName}, got null from getFirstItemTypeIDForItemTypeName`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all test applications for item type name.'});
        }

        logger.debug(`Got item type ID ${itemTypeID} for the item type name ${req.params.itemTypeName}`);
  
        testApplications = await testApplicationRepository.getAllTestApplicationsForItemType(itemTypeID);

        logger.debug(`Returned test applications for item type ID ${itemTypeID} - ${JSON.stringify(testApplications, null, 2)}`);

        res.status(HTTP_STATUS.OK).json(testApplications);

  }
  catch (error)
  {
    logger.debug(`Failed to get all test applications for item type ${req.params.itemTypeName}: ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all test applications for item type.' });
  }
});

router.get('/download-link/:testAppName/:testAppVersion', async (req, res) => {
  const testAppName = req.params.testAppName;
  const testAppVersion = req.params.testAppVersion;

  logger.debug(`GET download link for test application ${testAppName}, version ${testAppVersion} started`);

  try
  {
    const downloadSetup = await awsService.getTestApplicationDownloadSetup(testAppName, testAppVersion);
    logger.debug(`Got download setup for test application ${testAppName}, version ${testAppVersion} - ${downloadSetup}`);
    res.json(downloadSetup); // Client will use this URL to download //TODO: define setup as an API...
  }
  catch (error)
  {
    let errorStr = `Failed to get download link for test application ${testAppName}, version ${testAppVersion}`;
    logger.debug(errorStr, `Error - ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
  }
});


module.exports = router;