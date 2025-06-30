// repositories/itemTypeRepositorySheets.js
const sheets = require('../dal/sheets/sheets');
const sheetsConstants = require('../dal/sheets/sheetsConstants');



module.exports = {
  addItemType: async (itemType) => {
    await sheets.appendRow(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.ITEM_TYPES_SHEET_NAME, [
      itemType._id,
      itemType.name,
      itemType.description,
      itemType.SNPrefix,
    ]);
  },

  getAllItemTypes: async () => {
    const rows = await sheets.getAllRows(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.ITEM_TYPES_SHEET_NAME, sheetsConstants.ItemTypesLastColumnName);
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      SNPrefix: row[3],
    }));
  },

  deleteItemTypeByUUID: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.ITEM_TYPES_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${sheetsConstants.ITEM_TYPES_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.ITEM_TYPES_SHEET_NAME, sheetId, sheetsConstants.ItemTypesLastColumnName, uuid);
  },
};
