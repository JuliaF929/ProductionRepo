// pages/TestApplicationsPage.js
import React from 'react';

function TestApplicationsPage() {
  const handleUploadClick = () => {
    alert('Upload Test Application clicked'); 
    // In the future, open a file picker or navigate to upload form
  };

  return (
    <div className="p-4">
      <h2>Test Applications</h2>
      <button className="btn btn-primary" onClick={handleUploadClick}>
        Upload Test Application
      </button>
    </div>
  );
}

export default TestApplicationsPage;
