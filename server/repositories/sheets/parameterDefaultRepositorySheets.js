// repositories/sheets/parameterDefaultRepositorySheets.js
const sheets = require('../../dal/sheets/sheets');
const logger = require('../../logger');
const sheetsConstants = require('../../dal/sheets/sheetsConstants');

module.exports = {
    addParameterDefault: async (parameterDefault) => {
    await sheets.appendRow(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME, [
        parameterDefault._id,
        parameterDefault.name,
        parameterDefault.description,
        parameterDefault.type,
        parameterDefault.defaultValue,
        parameterDefault.itemTypeID,
    ]);
  },

  getAllParameterDefaults: async () => {
    const rows = await sheets.getAllRows(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME, sheetsConstants.ParameterDefaultsLastColumnName);
    return rows.map(row => ({
      _id: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemTypeID: row[5],
    }));
  },

  getAllParameterDefaultsForItemType: async(itemTypeID) => {
    const rows = await sheets.getRowsByValue(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, 
                                             sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME, 
                                             sheetsConstants.ParameterDefaultsLastColumnName, 
                                             itemTypeID, 
                                             sheetsConstants.ParameterDefaultsLastColumnName);
    return rows.map(row => ({
      _id: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      defaultValue: row[4],
      itemTypeID: row[5],
    }));
  },

  deleteParameterDefaultByUUID: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${sheetsConstants.ITEM_TYPES_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME, sheetId, sheetsConstants.ParameterDefaultsLastColumnName, uuid);
  },
};
