import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextComponent from '../components/TextComponent';

function TestApplicationPage({action}) {
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [description, setDescription] = useState('');
  const [ECONumber, setECONumber] = useState('');

  // Create a ref to programmatically click the hidden input
  const fileInputRef = useRef(null);
  
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{action === 'create' ? 'Create Test Application' : 'Edit Test Application'}</h2>

  <div className="mb-4">
    <TextComponent name={name} onChange={setName} label={'Test Application Name'}/>
  </div>

  <div className="mb-4">
    <TextComponent name={versionNumber} onChange={setVersionNumber} label={'Test Application Version Number'}/>
  </div>

  <div className="mb-4">
    <TextComponent name={description} onChange={setDescription} label={'Test Application Description'}/>
  </div>

  <div className="mb-4">
    <TextComponent name={ECONumber} onChange={setECONumber} label={'ECO#'}/>
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

  </div>
  );
}

export default TestApplicationPage;