const { google } = require('googleapis');
const path = require('path');

const logger = require('./logger');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'productionapp-463314-77556795ce19.json'), 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRow(spreadsheetId, sheetName, rowValues) {

  logger.debug("spreadsheetId is " + spreadsheetId);
  logger.debug("sheetName is " + sheetName);
  logger.debug("rowValues is " + rowValues);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [rowValues], // e.g., ['Alice', '2025-06-18', 'Approved']
    },
  });

  console.log('Append response:', response.data);
}

module.exports = { appendRow };
