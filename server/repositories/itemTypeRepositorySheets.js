// repositories/itemTypeRepositorySheets.js
const sheets = require('../dal/sheets/sheets');

const ITEM_TYPES_SPREADSHEET_ID = '1voxpnpkFEZs8UOZKfHk4jK2C6jbvfwsul68NYxwvze0'; // From the sheet URL
const ITEM_TYPES_SHEET_NAME     = 'ItemTypes'; 

module.exports = {
  addItemType: async (itemType) => {
    await sheets.appendRow(ITEM_TYPES_SPREADSHEET_ID, ITEM_TYPES_SHEET_NAME, [
      itemType._id,
      itemType.name,
      itemType.description,
      itemType.SNPrefix,
    ]);
  },

  getAllItemTypes: async () => {
    const rows = await sheets.getAllRows(ITEM_TYPES_SPREADSHEET_ID, ITEM_TYPES_SHEET_NAME, 'D');
    return rows.map(row => ({
      uuid: row[0],
      name: row[1],
      description: row[2],
      SNPrefix: row[3],
    }));
  },

  deleteItemTypeByUUID: async (uuid) => {
    const sheetId = await sheets.getSheetIdByName(ITEM_TYPES_SPREADSHEET_ID, ITEM_TYPES_SHEET_NAME);
    if (sheetId === null)
    {
        logger.error(`Sheet with name ${ITEM_TYPES_SPREADSHEET_ID} not found.`);
        return false;
    }
    return sheets.deleteRowByUUID(ITEM_TYPES_SPREADSHEET_ID, ITEM_TYPES_SHEET_NAME, sheetId, 'D', uuid);
  },
};
