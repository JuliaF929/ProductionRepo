const sheets = require('../dal/sheets/sheets');
const sheetsConstants = require('../dal/sheets/sheetsConstants');
const logger = require('../logger');

function buildItemTypeInsertRequest(itemType, sheetId) {
  return {
    appendCells: {
      sheetId,
      rows: [{
        values: [
          { userEnteredValue: { stringValue: itemType._id } },
          { userEnteredValue: { stringValue: itemType.name } },
          { userEnteredValue: { stringValue: itemType.description } },
          { userEnteredValue: { stringValue: itemType.SNPrefix } },
        ],
      }],
      fields: '*',
    },
  };
}

function buildParameterDefaultsInsertRequests(itemType, parameterDefaults, sheetId) {
  return parameterDefaults.map(param => ({
    appendCells: {
      sheetId,
      rows: [{
        values: [
          { userEnteredValue: { stringValue: param._id } },
          { userEnteredValue: { stringValue: param.name } },
          { userEnteredValue: { stringValue: param.description } },
          { userEnteredValue: { stringValue: param.type } },
          { userEnteredValue: { stringValue: param.defaultValue } },
          { userEnteredValue: { stringValue: itemType._id } },
        ],
      }],
      fields: '*',
    },
  }));
}

//add item type with default parameters related to it and the test applications realated to it (TBD)
async function addAtomicItemType(itemType, parameterDefaults) {
  
  // Build individual requests
  const requests = [];

  // 1. Add ItemType row (e.g., to ItemTypes sheet)
  const itemTypesSheetId = await sheets.getSheetIdByName(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.ITEM_TYPES_SHEET_NAME);
  logger.debug(`sheetId for ItemType tab resolved to: ${itemTypesSheetId} (type: ${typeof itemTypesSheetId})`);
  requests.push(buildItemTypeInsertRequest(itemType, itemTypesSheetId));

  // 2. Add ParameterDefaults rows (e.g., to ParameterDefaults sheet)
  const parameterDefaultsSheetId = await sheets.getSheetIdByName(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, sheetsConstants.PARAMETER_DEFAULTS_SHEET_NAME);
  logger.debug(`sheetId for ParameterDefaults tab resolved to: ${parameterDefaultsSheetId} (type: ${typeof parameterDefaultsSheetId})`);
  requests.push(...buildParameterDefaultsInsertRequests(itemType, parameterDefaults, parameterDefaultsSheetId));

  // 3. Call Google Sheets BatchUpdate once
  await sheets.runBatchUpdate(sheetsConstants.ITEM_TYPES_SPREADSHEET_ID, requests);
}

module.exports = { addAtomicItemType };