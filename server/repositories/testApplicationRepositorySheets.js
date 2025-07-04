// repositories/testApplicationRepositorySheets.js
const sheets = require('../dal/sheets/sheets');
const logger = require('../logger');
const sheetsConstants = require('../dal/sheets/sheetsConstants');

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
    ]);
  },

  getAllTestApplications: async () => {
    const rows = await sheets.getAllRows(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.TEST_APPLICATIONS_SHEET_NAME, sheetsConstants.TestApplicationsLastColumnName);
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      versionNumber: row[2],
      description: row[3],
      ECONumber: row[4],
      UploadDate: row[5],
      EffectiveDate: row[6],
      UploadUser: row[7],
      Path: row[8],
    }));
  },

/*   getAllParameterDefaultsForItemType: async(itemTypeID) => {
    const rows = await sheets.getRowsByValue(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, 
                                             sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME, 
                                             sheetsConstants.ParameterDefaultsLastColumnName, 
                                             itemTypeID, 
                                             sheetsConstants.ParameterDefaultsLastColumnName);
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemTypeID: row[5],
    }));
  }, */

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
