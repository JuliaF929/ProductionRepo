const express = require('express');
const router = express.Router();
const logger = require('../../logger');
const { format } = require('date-fns');

const TestApplication = require('../models/test-applications');

// Later can swap this line to use a MongoDB or another repository
const testApplicationRepository = require('../../repositories/testApplicationRepositorySheets');

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
        Path: 'TODO: not implemented yet'
    });

    logger.debug(`Received test application, \
                  name:${testApplication.name}, \
                  versionNumber: ${testApplication.versionNumber}, \
                  description: ${testApplication.description}, \
                  ECONumber: ${testApplication.ECONumber}, \
                  UploadUser: ${testApplication.UploadUser}, \
                  Path: ${testApplication.Path}`);
 
    try
     {
        await testApplicationRepository.addTestApplication(testApplication);

        res.status(201).json({
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
                      Path: ${testApplication.Path}`);
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

    const rows = await testApplicationRepository.getAllTestApplications();
    const testApplications = rows.map(row => ({
      uuid: row[0],
      name: row[1],
      versionNumber: row[2],
      description: row[3],
      ECONumber: row[4],
      UploadDate: row[5],
      EffectiveDate: row[6],
      UploadUser: row[7],
      Path: row[8]
    }));

    res.status(200).json(testApplications);

    logger.debug(`Returned 200 response with all existing test applications (count: ${testApplications.length}).`);
    return; 
  }
   catch (error)
  {
    logger.debug(`Failed to get all test applications: ${error}`);
    res.status(500).json({ message: 'Failed to get all test applications.' });
  }
});


router.delete('/:uuid', async (req, res) => {

  const uuid = req.params.uuid;
  
  try {

    const deleteResult = await testApplicationRepository.deleteTestApplicationByUUID(req.params.uuid);

    if (deleteResult === false  ) {
      return res.status(404).json({ message: 'Test application not found' });
    }

    res.status(200).json({ message: 'Test application deleted successfully' });

  } catch (error) {
    logger.debug(`Failed to delete test application with uuid: ${uuid}:, error: ${error}`);
    res.status(500).json({ message: 'Failed to delete test application' });
  }
});



module.exports = router;