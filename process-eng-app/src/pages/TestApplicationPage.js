import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextComponent from '../components/TextComponent';
import constants from '../constants';

function TestApplicationPage({action}) {
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [description, setDescription] = useState('');
  const [ECONumber, setECONumber] = useState('');
  const addTriggered = useRef(false);

  // Create a ref to programmatically click the hidden input
  const fileInputRef = useRef(null);

  const clearFields = () => {
    setName('');
    setVersionNumber('');
    setDescription('');
    setECONumber('');
  };


 
    // Trigger input click when user clicks the link or button
    const handleOpenFolderPicker = (e) => {
      e.preventDefault();
      fileInputRef.current.click();
    };
  
    // Handle folder selection (fires automatically when user picks a folder)
    const handleFolderSelect = (event) => {
      const files = Array.from(event.target.files);
      console.log('✅ Folder contents:', files);
  
      // Example: Print relative file paths
      files.forEach(file => {
        console.log(file.webkitRelativePath);  // Shows folder structure
      });
  
      // TODO: You can start your auto-upload logic here
    };

    const validateTestApplicationData = (name, versionNumber, description, ECONumber) => {

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
  
    //TODO: more validations
  
    return {isValid: true, message: ''};
  };


  const handleAddTestApplicationOnServer = async (name, versionNumber, description, ECONumber) => {
    try {
      
      if (addTriggered.current) 
        {
          console.log('addTriggered.current is true, returning');
          return; // Prevent second call  
        }

      addTriggered.current = true;
  
      const response = await fetch('http://localhost:5000/test-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          versionNumber: versionNumber,
          description: description,
          ECONumber: ECONumber
        }),
      });
  
      // Print the raw response text
      const rawBody = await response.text();
      console.log('Raw response body:', rawBody);

      if (!response.ok) {
        throw new Error('Failed to add test application with name ' + name);
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

    console.log(`before handleAddTestApplicationOnServer, new test application name: ${name}, versionNumber: ${versionNumber}, description: ${description}, ECO# ${ECONumber}`);
    const { isValid, message } = validateTestApplicationData(name, versionNumber, description, ECONumber);
    if (isValid == false) {
        alert(message);
        console.log(message);
        return;
    }

    handleAddTestApplicationOnServer(name, versionNumber, description, ECONumber);

    addTriggered.current = false;

    clearFields();
   
    //TODO: add new test application to the list of test applications
    //TODO: select the new test application in the list of test applications
    //TODO: selected test application's data is shown at the  right as usual 
    console.log(`after handleAddTestApplicationOnServer, new test application name = ${name}`);

  };
  return (
    <div className="container mt-4">
      <h2 className="mb-4">{action === 'create' ? 'Create Test Application' : 'Edit Test Application'}</h2>

  <div className="mb-4">
    <TextComponent text={name} onChange={setName} label={'Test Application Name'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={versionNumber} onChange={setVersionNumber} label={'Test Application Version Number'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={description} onChange={setDescription} label={'Test Application Description'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={ECONumber} onChange={setECONumber} label={'ECO#'}/>
  </div>

      {/* Custom link (or replace with a button if you prefer) */}
      <a href="#" onClick={handleOpenFolderPicker}>📂 Upload Test Application</a>

      {/* Hidden file input */}
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderSelect}
      />

  <div className="mb-5">
    <button
      className="btn btn-success"
      onClick={handleAddTestApplication}>{action === 'create' ? 'Create Test Application' : 'Edit Test Application'}
    </button>
  </div>

  </div>
  );
}

export default TestApplicationPage;