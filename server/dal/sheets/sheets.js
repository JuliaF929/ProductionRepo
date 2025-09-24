const { google } = require('googleapis');
const path = require('path');

const logger = require('../../logger');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'productionapp-463314-77556795ce19.json'), 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRow(spreadsheetId, sheetName, rowValues) {

  logger.debug(`Going to append one row to spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}, rowValues: ${rowValues}`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  logger.debug(`Authenticated successfully with Google Sheets API in appendRow.`);

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [rowValues], // e.g., ['Alice', '2025-06-18', 'Approved']
    },
  });

  logger.debug(`Append response: ${response.data}`);
}

// "A" -> 0, "B" -> 1, ..., "Z" -> 25, "AA" -> 26, "AB" -> 27, ...
function resolveColumnIndex(columnA1) {
  if (typeof columnA1 !== 'string') return -1;
  const s = columnA1.trim().toUpperCase();
  if (!/^[A-Z]+$/.test(s)) return -1;

  let n = 0;
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 64); // 'A' = 65 -> 1
  }
  return n - 1; // zero-based
}


async function getRowsByValue(spreadsheetId, sheetName, lastColumnName, valueToFilterBy, columnNameToFilterBy) {
  try
  {
    logger.debug(`Going to get all rows where a specific column matches a given value from spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}, lastColumnName: ${lastColumnName}, columnNameToFilterBy: ${columnNameToFilterBy}, valueToFilterBy: ${valueToFilterBy}`);

    const rows = await getAllRows(spreadsheetId, sheetName, lastColumnName);

    logger.debug(`Got all rows by getAllRows, count: ${(await rows).length}`);
    if (!Array.isArray(rows) || rows.length === 0) {
      logger.warn(`getRowsByValue: no rows returned`);
      return [];
    }
    logger.debug(`Starting filterring by valueToFilterBy: ${valueToFilterBy} at columnNameToFilterBy: ${columnNameToFilterBy}`);

    const colIdx = resolveColumnIndex(columnNameToFilterBy);
    if (colIdx < 0) {
      logger.warn(`getRowsByValue: column '${columnNameToFilterBy}' not found`);
      return [];
    }

    // Filter rows by column match 
    const matchingRows = rows.filter((row, index) => {
     //return row[columnNumberToFilterBy - 1] === valueToFilterBy;
     return row[colIdx] === valueToFilterBy;
    });

    logger.debug(`In getRowsByValue got matchingRows count: ${matchingRows.length}`);

    return matchingRows;
  }
  catch (err) {
    //Don’t crash the server—log and return a safe value
    logger.error(err, `getRowsByValue failed for sheet ${sheetName}`);
    return [];
  }
}


async function getAllRows(spreadsheetId, sheetName, lastColumnName) {

  logger.debug(`Going to get all rows from spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  logger.debug(`Authenticated successfully with Google Sheets API in getAllRows.`);

  const range = `${sheetName}!A2:${lastColumnName}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || []; //If response.data.values exists, use it. Otherwise, use an empty array [].
  logger.debug(`Fetched ${rows.length} rows from range ${range}.`);
  logger.debug(`Rows: ${JSON.stringify(rows, null, 2)}`);

  return rows;
}

async function getSheetIdByName(spreadsheetId, sheetName) {
  
  logger.debug(`Going to getSheetIdByName spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.get({ spreadsheetId });

  logger.debug(`In getSheetIdByName got response for spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`);

  const sheet = response.data.sheets.find(
    s => s.properties.title === sheetName
  );

  return sheet ? sheet.properties.sheetId : null;
}

async function deleteRowByUUID(spreadsheetId, sheetName, sheetId, lastColumnName, uuid) {

  logger.debug(`Going to delete row from spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}, UUID: ${uuid}`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  logger.debug(`Authenticated successfully with Google Sheets API in deleteRowByUUID.`);

  const range = `${sheetName}!A2:${lastColumnName}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === uuid);

  if (rowIndex === -1) {
    logger.debug(`Item with uuid: ${uuid} not found.`);
    return false; 
  }

  const absoluteRowIndex = rowIndex + 2; // A2 = row 2, so +1 for header, +1 for 0-based

  logger.debug(`In deleteRowByUUID, absoluteRowIndex=${absoluteRowIndex}, startIndex=${absoluteRowIndex - 1}, endIndex=${absoluteRowIndex}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId, // must be the numeric ID, not the sheet name
            dimension: 'ROWS',
            startIndex: absoluteRowIndex - 1,
            endIndex: absoluteRowIndex,
          },
        },
      }],
    },
  });

  logger.debug(`Item with uuid: ${uuid} found and deleted.`);
  return true; 

}

async function runBatchUpdate(spreadsheetId, requests) {

  logger.debug(`Going to runBatchUpdate in spreadsheetId: ${spreadsheetId}`);

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  logger.debug(`Authenticated successfully with Google Sheets API in runBatchUpdate.`);

  return sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: { requests },
  });
  
}

module.exports = { appendRow, getAllRows, getRowsByValue, deleteRowByUUID, getSheetIdByName, runBatchUpdate };
