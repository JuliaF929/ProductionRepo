const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require('../../logger');

const s3 = new S3Client({ region: "us-east-2" });
const bucketName = "calibrix-s3";

const operatorAppName = "CalibrixOperatorWin_";
const operatorAppExtension = ".exe";

//TODO: the company name folder should be dynamic, not hardcoded

/*
Regarding aws s3 folders creation if not exists:
    1. You don’t have to create folders — if you upload an object with key
       companies/dummy-company/test-applications/myapp_1.0.0.zip
       the “folder” hierarchy is implied and AWS Console will show the folder automatically.

       2. Explicitly creating folders is only useful if you want to see an empty folder in the console, 
          or enforce IAM policies on prefixes.
*/

function getTestApplicationFileName(testAppName, testAppVersion) {
  return `${testAppName}_${testAppVersion}.zip`;
}

function getTestApplicationS3Key(testAppName, testAppVersion) {
  const fileName = getTestApplicationFileName(testAppName, testAppVersion);
  return `dummy-company/test-applications/${testAppName}/${fileName}`;
}

function normalizePart(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")           // replace spaces with underscores
    .replace(/[^\w\-.]/g, "");      // allow A-Z, a-z, 0-9, _, -, and DOT
}

function getReportFileName(itemSerialNumber, actionName, actionVersion, timestampUTC) {
  if (!itemSerialNumber || !actionName || !actionVersion || !timestampUTC) {
    throw new Error("Invalid parameters to generate report file name.");
  }

  const sn = normalizePart(itemSerialNumber);
  const name = normalizePart(actionName);
  const version = normalizePart(actionVersion);
  const ts = normalizePart(timestampUTC);

  return `report_${sn}_${name}_${version}_${ts}.pdf`;
}

function getReportS3Key(itemType, itemSerialNumber, actionName, actionVersion, timestampUTC) {
  const fileName = getReportFileName(itemSerialNumber, actionName, actionVersion, timestampUTC);
  const itemTypeNormalized = normalizePart(itemType);
  const itemSerialNumberNormalized = normalizePart(itemSerialNumber);

  return `dummy-company/reports/${itemTypeNormalized}/${itemSerialNumberNormalized}/${fileName}`;
}

async function getReportDownloadSetup(itemType, itemSN, actionName, actionVersion, timestampUTC) {
  
  const fileName = getReportFileName(itemSN, actionName, actionVersion, timestampUTC);
  let awsFilePathAndName = getReportS3Key(itemType, itemSN, actionName, actionVersion, timestampUTC); 

  // Generate a presigned URL for the S3 object
  const command = new GetObjectCommand({ Bucket: bucketName, Key: awsFilePathAndName });
  // Link valid for 5 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  logger.debug(`Generated presigned URL for report download: ${url}, fileName: ${fileName}`);

  return {
    url,
    fileName
  };
}
async function getTestApplicationDownloadSetup(testAppName, testAppVersion) {
  
  const testAppNameNormalized = testAppName.toLowerCase();
  const testAppVersionNormalized = testAppVersion.toLowerCase();

  const fileName = getTestApplicationFileName(testAppNameNormalized, testAppVersionNormalized);
  let awsFilePathAndName = getTestApplicationS3Key(testAppNameNormalized, testAppVersionNormalized);

  // Generate a presigned URL for the S3 object
  const command = new GetObjectCommand({ Bucket: bucketName, Key: awsFilePathAndName });
  // Link valid for 5 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    url,
    fileName
  };
}

async function getTestApplicationUploadSetup(testAppName, testAppVersion) {
  
    const testAppNameNormalized = testAppName.toLowerCase();
    const testAppVersionNormalized = testAppVersion.toLowerCase();

    let awsFilePathAndName = getTestApplicationS3Key(testAppNameNormalized, testAppVersionNormalized);

    // Generate a presigned URL for the S3 object
    const command = new PutObjectCommand({ Bucket: bucketName, Key: awsFilePathAndName, ContentType: "application/zip" });
    // Link valid for 5 minutes
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  
    return { url };
}

async function uploadReport(itemType, itemSerialNumber, actionName, actionVersion, timestampUTC, pdfBuffer) {
  
  try
  {
    const itemTypeNormalized = itemType.toLowerCase();
    const itemSerialNumberNormalized = itemSerialNumber.toLowerCase();
    const actionNameNormalized = actionName.toLowerCase();
    const actionVersionNormalized = actionVersion.toLowerCase();

    let awsFilePathAndName = getReportS3Key(itemTypeNormalized, itemSerialNumberNormalized, actionNameNormalized, actionVersionNormalized, timestampUTC);

    //upload report to s3
    await s3.send(new PutObjectCommand({ Bucket: bucketName, 
                                         Key: awsFilePathAndName, 
                                         Body: pdfBuffer,
                                         ContentType: "application/pdf" }));

    return "";
  }
  catch (err) {
    msg = `Failed to upload report for item SN ${itemSerialNumber}, action ${actionName}, version ${actionVersion} at ${timestampUTC}: ${err}`;
    logger.debug(msg);

    return msg;
  }
}


function getOperatorAppWinFileName(versionNumber) {
  if (!versionNumber) {
    throw new Error("Invalid version number to generate OperatorApp win installer file name.");
  }
  
  const versionNumberNormalized = normalizePart(versionNumber);
  return `${operatorAppName}${versionNumberNormalized}${operatorAppExtension}`;
}

function getOperatorAppWinS3Key(versionNumber) {
  const fileName = getOperatorAppWinFileName(versionNumber);
  return `operatorapps/windows/${fileName}`;
}

async function getOperatorAppWinDownloadSetup(versionNumber) {
  
  const fileName = getOperatorAppWinFileName(versionNumber);
  let awsFilePathAndName = getOperatorAppWinS3Key(versionNumber); 

  // Generate a presigned URL for the S3 object
  const command = new GetObjectCommand({ Bucket: bucketName, Key: awsFilePathAndName, ResponseContentDisposition: `attachment; filename="${fileName}"`, });
  // Link valid for 5 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  logger.debug(`Generated presigned URL for OperatorApp download: ${url}, fileName: ${fileName}`);

  return {
    url,
    fileName
  };
}

module.exports = { getTestApplicationDownloadSetup, 
                   getTestApplicationUploadSetup, 
                   uploadReport, 
                   getReportDownloadSetup,
                   getReportFileName,
                   getOperatorAppWinDownloadSetup };