// repositories/sheets/testApplicationRepositorySheets.js
const sheets = require('../../dal/sheets/sheets');
const logger = require('../../logger');
const sheetsConstants = require('../../dal/sheets/sheetsConstants');

module.exports = {
    addTestApplication: async (testApplication) => {
    await sheets.appendRow(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.TEST_APPLICATIONS_SHEET_NAME, [
        testApplication._id,
        testApplication.name,
        testApplication.versionNumber,
        testApplication.description,
        testApplication.ECONumber,
        testApplication.UploadDate,
        testApplication.EffectiveDate,
        testApplication.UploadUser,
        testApplication.Path,
        testApplication.testAppExeName,
    ]);
  },

  getAllTestApplications: async () => {
    const rows = await sheets.getAllRows(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.TEST_APPLICATIONS_SHEET_NAME, sheetsConstants.TestApplicationsLastColumnName);
    return rows.map(row => ({
      _id: row[0],
      name: row[1],
      versionNumber: row[2],
      description: row[3],
      ECONumber: row[4],
      UploadDate: row[5],
      EffectiveDate: row[6],
      UploadUser: row[7],
      Path: row[8],
      testAppExeName: row[9],
    }));
  },

  getAllTestApplicationsForItemType: async(itemTypeID) => {

    logger.debug(`getAllTestApplicationsForItemType for ${itemTypeID}.`);

    //1. get from ItemType_TestApplication sheet all rows with given itemTypeID
    const rows = await sheets.getRowsByValue(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, 
                                             sheetsConstants.ITEM_TYPE_TEST_APPLICATIONS_SHEET_NAME, 
                                             sheetsConstants.ItemTypeTestApplicationsLastColumnName, 
                                             itemTypeID, 
                                             sheetsConstants.ItemTypeTestApplicationsItemTypeID);

    
    logger.debug(`getAllTestApplicationsForItemType - got test apps IDs for ${itemTypeID} - ${JSON.stringify(rows, null, 2)}`)
    //2. return from  TestApplications sheet all test application with given IDs
    const allTestAppsForItemType = [];
    for (const row of rows) 
    {
      //row[0] - itemTypeiD, row[1] - testAppID
      const testAppId = row[1];
      const testApp = await sheets.getRowsByValue(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, 
                                                  sheetsConstants.TEST_APPLICATIONS_SHEET_NAME,
                                                  sheetsConstants.TestApplicationsLastColumnName,
                                                  testAppId,
                                                  sheetsConstants.TestApplicationsTestApplicationIDColumnName);

      allTestAppsForItemType.push(...testApp);
    }
    
    return allTestAppsForItemType;

  },

  deleteTestApplicationByUUID: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.TEST_APPLICATIONS_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${sheetsConstants.ITEM_TYPES_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.TEST_APPLICATIONS_SHEET_NAME, sheetId, sheetsConstants.TestApplicationsLastColumnName, uuid);
  },
};
