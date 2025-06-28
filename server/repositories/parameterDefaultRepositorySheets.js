// module.exports = {
//     addParameterDefault: async (parameterDefault) => { /* Implement for Sheets or MongoDB or other DB*/ },
//     getAllParameterDefaults: async () => { /* Implement for Sheets or MongoDB or other DB*/ },
//     getAllParameterDefaultsForItemType: async (itemTypeID) => { /* Implement for Sheets or MongoDB or other DB*/ }, 
//     deleteParameterDefault: async (uuid) => { /* Implement for Sheets or MongoDB or other DB*/ }
//   };

// repositories/parameterDefaultRepositorySheets.js
const sheets = require('../dal/sheets/sheets');

const PARAMETER_DEFAULTS_SPREADSHEET_ID = '12GNb3F-uzd0XnaZ3HB1wfU53fXZaFngG1If5eMgo6aQ'; // From the sheet URL
const PARAMETER_DEFAULTS_SHEET_NAME     = 'ParameterDefaults'; 
const LastColumnName = 'F';
const ItemTypeIDColumnName = 'F';

module.exports = {
    addParameterDefault: async (parameterDefault) => {
    await sheets.appendRow(PARAMETER_DEFAULTS_SPREADSHEET_ID, PARAMETER_DEFAULTS_SHEET_NAME, [
        parameterDefault._id,
        parameterDefault.name,
        parameterDefault.description,
        parameterDefault.type,
        parameterDefault.defaultValue,
        parameterDefault.itemTypeID,
    ]);
  },

  getAllParameterDefaults: async () => {
    const rows = await sheets.getAllRows(PARAMETER_DEFAULTS_SPREADSHEET_ID, PARAMETER_DEFAULTS_SHEET_NAME, LastColumnName);
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemTypeID: row[5],
    }));
  },

  getAllParameterDefaultsForItemType: async(itemTypeID) => {
    const rows = await sheets.getRowsByValue(PARAMETER_DEFAULTS_SPREADSHEET_ID, 
                                             PARAMETER_DEFAULTS_SHEET_NAME, 
                                             LastColumnName, 
                                             itemTypeID, 
                                             ItemTypeIDColumnName);
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemTypeID: row[5],
    }));
  },

  deleteParameterDefault: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(PARAMETER_DEFAULTS_SPREADSHEET_ID, PARAMETER_DEFAULTS_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${PARAMETER_DEFAULTS_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(PARAMETER_DEFAULTS_SPREADSHEET_ID, PARAMETER_DEFAULTS_SHEET_NAME, sheetId, LastColumnName, uuid);
  },
};
