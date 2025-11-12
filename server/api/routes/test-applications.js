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
const itemActionsHistoryRepository = require('../../repositories/mongodb/itemActionHistoryRepositoryMongo');

const { v4: uuidv4 } = require('uuid');
const { log } = require('winston');

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

//get all test applications meta data for the given item type and itemSN
router.get('/:itemTypeName/:itemSN', async (req, res) => {

  logger.debug(`GET all test applications meta data for itemSN: ${req.params.itemSN}, of type: ${req.params.itemTypeName} started`);
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

        //1. get all test applications for this item type
        logger.debug(`Got item type ID ${itemTypeID} for the item type name ${req.params.itemTypeName}`);
        testApplications = await testApplicationRepository.getAllTestApplicationsForItemType(itemTypeID);
        logger.debug(`Returned test applications for item type ID ${itemTypeID} - ${JSON.stringify(testApplications, null, 2)}`);

        //2. get actions already done for this itemSN
        logger.debug(`Going to retrieve all actions already performed by itemSN ${req.params.itemSN}`);
        const doneActions = await itemActionsHistoryRepository.getActionsDoneForItemSN(req.params.itemSN);
        logger.debug(`All actions already performed by itemSN ${req.params.itemSN} are: ${JSON.stringify(doneActions, null, 2)}`);

        //3. remove duplicates for this itemSN so only the latest instance of each done action remains
        const uniqueDoneActionsMap = new Map();

        for (let i = doneActions.length - 1; i >= 0; i--) {
          const action = doneActions[i];
          const existing = uniqueDoneActionsMap.get(action.actionName);
        
          if (!existing) {
            // first occurrence
            uniqueDoneActionsMap.set(action.actionName, action);
          } else if (action.endExecutionDateTimeUTC > existing.endExecutionDateTimeUTC) {
            // replace if newer
            uniqueDoneActionsMap.set(action.actionName, action);
          }
        }
        
        // Convert back to array if needed
        const uniqueDoneActions = Array.from(uniqueDoneActionsMap.values());
        
        logger.debug(`Unique done actions for itemSN ${req.params.itemSN} are: ${JSON.stringify(uniqueDoneActions, null, 2)}`);

        //4. merge data of actions already done by this itemSN to default actions list for this item type 
        const testApplicationsForItem = [];
        for (let i = 0; i < testApplications.length; i++)
        {
            const app = {};

            app.itemSerialNumber = req.params.itemSN;
            app.itemType = req.params.itemTypeName;

            app.actionSWVersionForExecution = testApplications[i][2];
            app.actionName = testApplications[i][1];
            app.actionExeName = testApplications[i][9];

            logger.debug(`Processing test application named ${testApplications[i][1]} for itemSN ${req.params.itemSN}`);

            const doneAction = uniqueDoneActions.find(action => action.actionName === testApplications[i][1]);
            if (doneAction)//if both next planned action exists and done action with same name also exists
            {
                logger.debug(`Done action exists for ${testApplications[i][1]} for itemSN ${req.params.itemSN}`);

                app.latestExecutionDateTimeUTC = doneAction.endExecutionDateTimeUTC;
                app.latestResult = doneAction.result;
                app.latestOperatorName = doneAction.operatorName;
                app.latestActionVersionNumber = doneAction.actionSWVersion;

                doneAction.requiredForExecution = true;
            }
            else //done action still does not exists (action to be executed for the first time)
            {
                logger.debug(`Done action does not exists for ${testApplications[i][1]} for itemSN ${req.params.itemSN}. Action to be executed for the 1st time.`);

                app.latestExecutionDateTimeUTC = null;
                app.latestResult = '-';
                app.latestOperatorName = '-';
                app.latestActionVersionNumber = '-';
            }

            testApplicationsForItem.push(app);
        }

        logger.debug(`Merged test applications for itemSN ${req.params.itemSN} are: ${JSON.stringify(testApplicationsForItem, null, 2)}`);

        //if done action exists, but there is no more such required action to execute (it was deleted probably)
        for (let j = 0; j < doneActions.length; j++)
        {
          const app = {};

          if (doneActions[j].requiredForExecution === false)
          {
              logger.debug(`No planned action, but Done action exists for ${doneActions[j].actionName} for itemSN ${req.params.itemSN} (Obsolete action)`);

              app.latestExecutionDateTimeUTC = doneActions[j].endExecutionDateTimeUTC;
              app.latestResult = doneActions[j].result;
              app.latestOperatorName = doneActions[j].operatorName;
              app.latestActionVersionNumber = doneActions[j].actionVersionNumber;

              app.itemSerialNumber = req.params.itemSN;
              app.itemType = req.params.itemTypeName;
  
              app.actionSWVersionForExecution = "";
              app.actionName = doneActions[j].actionName;
              app.actionExeName = "";

              testApplicationsForItem.push(app);
          }
        } 

        logger.debug(`Final test applications for itemSN ${req.params.itemSN} (returning) are: ${JSON.stringify(testApplicationsForItem, null, 2)}`);

        res.status(HTTP_STATUS.OK).json(testApplicationsForItem);
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
    logger.debug(`Got download setup for test application ${testAppName}, version ${testAppVersion} - url: ${downloadSetup.url}, fileName: ${downloadSetup.fileName}`); 
    res.json(downloadSetup); // Client will use this URL to download //TODO: define setup as an API...
  }
  catch (error)
  {
    let errorStr = `Failed to get download link for test application ${testAppName}, version ${testAppVersion}`;
    logger.debug(`${errorStr}, Error - ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
  }
});

router.get('/upload-link/:testAppName/:testAppVersion', async (req, res) => {
  //TODO: why this is a separate endpoint?
  const testAppName = req.params.testAppName;
  const testAppVersion = req.params.testAppVersion;

  logger.debug(`GET upload link for test application ${testAppName}, version ${testAppVersion} started`);

  try
  {
    const uploadSetup = await awsService.getTestApplicationUploadSetup(testAppName, testAppVersion);
    logger.debug(`Got upload setup for test application ${testAppName}, version ${testAppVersion} - url: ${uploadSetup.url}`);
    res.json(uploadSetup); // Client will use this URL to upload //TODO: define setup as an API...
  }
  catch (error)
  {
    let errorStr = `Failed to get upload link for test application ${testAppName}, version ${testAppVersion}`;
    logger.debug(`${errorStr}, Error - ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: errorStr });
  }
});

module.exports = router;