// repositories/itemTypeRepositorySheets.js
const sheets = require('../dal/sheets/sheets');
const constants = require('../../shared/constants');

module.exports = {
  addItemType: async (itemType) => {
    await sheets.appendRow(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME, [
      itemType._id,
      itemType.name,
      itemType.description,
      itemType.SNPrefix,
    ]);
  },

  getAllItemTypes: async () => {
    const rows = await sheets.getAllRows(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME, 'D');
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      SNPrefix: row[3],
    }));
  },

  deleteItemTypeByUUID: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${constants.ITEM_TYPES_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(constants.ITEM_TYPES_SPREADSHEET_ID, constants.ITEM_TYPES_SHEET_NAME, sheetId, 'D', uuid);
  },
};
