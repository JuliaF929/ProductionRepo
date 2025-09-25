// repositories/sheets/itemTypeRepositorySheets.js
const sheets = require('../../dal/sheets/sheets');
const sheetsConstants = require('../../dal/sheets/sheetsConstants');
const logger = require('../../logger');


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
      _id: row[0],
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

  getFirstItemTypeIDForItemTypeName: async(itemTypeName) => {
    try {
      const rows = await sheets.getRowsByValue(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, 
                                               sheetsConstants.ITEM_TYPES_SHEET_NAME, 
                                               sheetsConstants.ItemTypesLastColumnName, 
                                               itemTypeName, 
                                               sheetsConstants.ItemTypeIDInItemTypesTableColumnName);

      if (!rows || rows.length === 0) {
        logger.debug(`No item type found for name: ${itemTypeName}`);
        return null; 
      }

      return rows[0][0];      
    }
    catch (err) {
      logger.error(err, 'getFirstItemTypeIDForItemTypeName failed');
      return null;
    }     
  },
};
