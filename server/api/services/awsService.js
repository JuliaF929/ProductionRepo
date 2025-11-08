const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require('../../logger');

const s3 = new S3Client({ region: "us-east-2" });
const bucketName = "production-julia-s3";

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

function getReportFileName(itemSerialNumber, actionName, actionVersion, timestampUTC) {
  return `report_${itemSerialNumber}_${actionName}_${actionVersion}_${timestampUTC}.pdf`;
}

function getReportS3Key(itemType, itemSerialNumber, actionName, actionVersion, timestampUTC) {
  const fileName = getReportFileName(itemSerialNumber, actionName, actionVersion, timestampUTC);
  return `dummy-company/reports/${itemType}/${itemSerialNumber}/${fileName}`;
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

module.exports = { getTestApplicationDownloadSetup, getTestApplicationUploadSetup, uploadReport };