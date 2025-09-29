import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-2" });
const bucketName = "production-julia-s3";

//TODO: the company name folder should be dynamic, not hardcoded
//TODO: 'test-applications' folder shall be created if not existing during the first test application upload
//TODO: specific test application folder shall be created if not existing during the first this specific test application upload

export async function getTestApplicationDownloadSetup(testAppName, testAppVersion) {
  
  const fileName = `${testAppName}_${testAppVersion}.zip`;
  let awsFilePathAndName = `dummy-company/test-applications/${testAppName}/${fileName}`;
  // Generate a presigned URL for the S3 object
  const command = new GetObjectCommand({ Bucket: bucketName, Key: awsFilePathAndName });
  // Link valid for 5 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    url,
    fileName
  };
}
