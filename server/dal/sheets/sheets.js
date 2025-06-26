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

  return rows;
}

async function getSheetIdByName(spreadsheetId, sheetName) {
  
  logger.debug(`Going to getSheetIdByName spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.get({ spreadsheetId });

  logger.debug(`In getSheetIdByName got response ${response} for spreadsheetId: ${spreadsheetId}, sheetName: ${sheetName}`);

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

module.exports = { appendRow, getAllRows, deleteRowByUUID, getSheetIdByName };
