import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextComponent from '../components/TextComponent';
import constants from '../constants';
import JSZip from "jszip";

function TestApplicationPage({action, testAppData}) {
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [description, setDescription] = useState('');
  const [ECONumber, setECONumber] = useState('');
  const addTriggered = useRef(false);
  const [testAppExeName, setTestAppExeName] = useState('');
  const [testAppFolder, setTestAppFolder] = useState('');
  const [zipBlob, setZipBlob] = useState(null);

  // Create a ref to programmatically click the hidden input
  const folderInputRef = useRef(null);
  const fileExeInputRef = useRef(null);

    // Update the fields when a new testAppData is passed in:
    useEffect(() => {
      console.log('testAppData: ' + JSON.stringify(testAppData, null, 2));
      if (testAppData) {
        setName(testAppData.name || '');
        setVersionNumber(testAppData.versionNumber || '');
        setDescription(testAppData.description || '');
        setECONumber(testAppData.ECONumber || '');
      }
    }, [testAppData]);

  const clearFields = () => {
    setName('');
    setVersionNumber('');
    setDescription('');
    setECONumber('');
  };


 
    // Trigger input click when user clicks the link
    const handleOpenFolderPicker = (e) => {
      e.preventDefault();
      folderInputRef.current?.click();
    };

     // Handle folder selection (fires automatically when user picks a folder)
    const handleFolderSelect = async (event) => {

      const files = Array.from(event.target.files);
      console.log('✅ Folder contents:', files);

      if (!files || files.length === 0) {
        alert('Selected folder is empty, please select a folder with files.');
        return;
      }

      if (files.length > 0) {
        // Extract the folder name from the first file's path
        const firstFilePath = files[0].webkitRelativePath;
        const folderName = firstFilePath.split('/')[0]; // Get the top-level folder name
        console.log(`Selected folder: ${folderName}`);
        setTestAppFolder(folderName);
      }

      //save the zip blob to memory
      const zip = new JSZip();
      // Add each file to the zip, preserving folder structure
      for (const file of files) 
      {
        // webkitRelativePath gives relative path inside selected folder
        // webkitRelativePath is like "WinCalib/bin/app.exe"
        const relativePath = file.webkitRelativePath.split("/").slice(1).join("/");
  
        // To get only flat files, file.name is used instead
        // but this way keeps subfolders (bin/app.exe) without the top-level folder
        zip.file(relativePath, file);
      }

      // Generate the ZIP as a Blob
      const blob = await zip.generateAsync({ type: "blob" });
      setZipBlob(blob);

      console.log("✅ ZIP created, size:", blob.size);

    };

    const handleChooseTestAppExe = (e) => {
      e.preventDefault();
      fileExeInputRef.current?.click();
    };

    const handleExeFileChosen = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        console.log(`Selected executable: ${file.name}`);
        setTestAppExeName(file.name);
      }
    };

    const validateTestApplicationData = (name, versionNumber, description, ECONumber, testAppExeName, zipBlob) => {

      //validations before pushing to the server
      if (!name) {
        return { isValid: false, message: 'Test Application Name is required.' };
      }
  
      if (name.length > constants.GENERAL_STRING_MAX_CHARS )  {
        return { isValid: false, message: 'Test Application name has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.' };
      }

      if (versionNumber.length > constants.GENERAL_STRING_MAX_CHARS )  {
        return { isValid: false, message: 'Test Application version number has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.' };
      }
  
      if (description.length > constants.DESCRIPTION_MAX_CHARS)  {
       return { isValid: false, message: 'Test Application Description has to be shorter than ' + constants.DESCRIPTION_MAX_CHARS + ' characters.' };
     }
     if (ECONumber.length > constants.GENERAL_STRING_MAX_CHARS )  {
      return { isValid: false, message: 'Test Application ECO# has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.'};
     }
     if (!testAppExeName) {
       return { isValid: false, message: 'Test Application Executable Name is required.' };
     }
     //if test Application Folder is not selected
     if (!zipBlob) {
      return { isValid: false, message: 'Error creating Zip for Test Application. Please re-choose Test Application folder.' };
     }
  
    //TODO: more validations
  
    return {isValid: true, message: ''};
  };

  const uploadTestApplicationZip = async (presignedUrl) => {
    console.log(`Uploading zip to presigned URL: ${presignedUrl}`);
    const res = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/zip"
      },
      body: zipBlob
    });
    return res;
  }
  

  const handleAddTestApplicationOnServer = async (name, versionNumber, description, ECONumber, testAppExeName, zipBlob) => {
    try {
      
      if (addTriggered.current) 
        {
          console.log('addTriggered.current is true, returning');
          return; // Prevent second call  
        }

      addTriggered.current = true;

      //get aws upload URL
      const awsResponse = await fetch(`${constants.API_BASE}/test-applications/upload-link/${encodeURIComponent(name)}/${encodeURIComponent(versionNumber)}`);
      const awsResponseJson = await awsResponse.json();
      if (!awsResponse.ok) {
            let errStr = `Failed to get AWS upload URL for test application ${name}, version ${versionNumber}, status: ${awsResponse.status}`;
            console.error(errStr);
            alert(errStr);
            return;
      }

      console.log(`Received AWS upload URL for test application ${name}, ver# ${versionNumber} - aws response: ${JSON.stringify(awsResponseJson, null, 2)}`);

      //upload to aws
      console.log(`Uploading test application zip to AWS S3, size: ${zipBlob.size} bytes, name: ${name}, ver#: ${versionNumber}, url: ${awsResponseJson.url}`);
      const uploadResult = await uploadTestApplicationZip(awsResponseJson.url);
      if (!uploadResult.ok) {
        let errStr = `Failed to save test application for test application ${name}, version ${versionNumber}, status: ${uploadResult.status}`;
        console.error(errStr);
        alert(errStr);
        return;
      }

      console.log(`Uploaded test application zip to AWS S3 for test application ${name}, version ${versionNumber}`);

      console.log('Now adding test application metadata to the server (database)...');

      const response = await fetch(`${constants.API_BASE}/test-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          versionNumber: versionNumber,
          description: description,
          ECONumber: ECONumber,
          testAppExeName: testAppExeName
        }),
      });
  
      // Print the raw response text
      const rawBody = await response.text();
      console.log('Raw response body:', rawBody);

      if (!response.ok) {
        const errStr = `Failed to add test application with name ${name}, ver# ${versionNumber}, status: ${response.status}`;
        console.error(errStr);
        alert(errStr);
      }

      try {
        const result = JSON.parse(rawBody);
        console.log('Parsed JSON:', result);
      } catch (e) {
        console.warn('Response is not valid JSON');
      }

    } catch (error) {
      console.error('Error:', error);

    }
  };
    // Create/Edit test application 
    const handleAddTestApplication = () => {

    console.log(`before handleAddTestApplicationOnServer, new test application name: ${name}, versionNumber: ${versionNumber}, description: ${description}, ECO# ${ECONumber}, testAppExeName ${testAppExeName}`);  
    const { isValid, message } = validateTestApplicationData(name, versionNumber, description, ECONumber, testAppExeName, zipBlob);
    if (isValid == false) {
        alert(message);
        console.log(message);
        return;
    }

    handleAddTestApplicationOnServer(name, versionNumber, description, ECONumber, testAppExeName, zipBlob);

    addTriggered.current = false;

    clearFields();
   
    //TODO: add new test application to the list of test applications
    //TODO: select the new test application in the list of test applications
    //TODO: selected test application's data is shown at the  right as usual 
    console.log(`after handleAddTestApplicationOnServer, new test application name = ${name}`);

  };
  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {action === 'create' ? 'Create Test Application' : action === 'edit' ? 'Edit Test Application' : 'View Test Application'}
      </h2>

  <div className="mb-4">
    <TextComponent text={name} onChange={setName} label={'Test Application Name'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={versionNumber} onChange={setVersionNumber} label={'Test Application Version Number'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={description} onChange={setDescription} label={'Test Application Description'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={ECONumber} onChange={setECONumber} label={'ECO#'} isDisabled={action === 'view'}/>
  </div>

  {action !== 'view' && (
<div className="mb-4">
      {/* Custom link (or replace with a button if you prefer) */}
      <a href="#" onClick={handleOpenFolderPicker}>📂 Choose Test Application Folder</a>
      <br />

      {/* Hidden file input */}
      <input
        type="file"
        style={{ display: 'none' }}
        ref={folderInputRef}
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderSelect}
      />
      <div style={{ marginTop: "8px", fontStyle: "italic" }}>
          ✅ Folder Selected: <strong>{testAppFolder}</strong>
      </div>

      <a href="#" onClick={handleChooseTestAppExe}>⚙️ Choose Test Application Executable File</a>
      <input
        type="file"
        ref={fileExeInputRef}
        style={{ display: "none" }}
        accept=".exe"
        onChange={handleExeFileChosen}
      />
      <div style={{ marginTop: "8px", fontStyle: "italic" }}>
          ✅ Executable File Selected: <strong>{testAppExeName}</strong>
      </div>

</div>
)}

{action !== 'view' && (
  <div className="mb-5">
    <button
      className="btn btn-success"
      onClick={handleAddTestApplication}>{action === 'create' ? 'Create Test Application' : 'Edit Test Application'}
    </button>
  </div>
)}
  </div>
  );
}

export default TestApplicationPage;