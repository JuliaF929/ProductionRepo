// pages/TestApplicationsPage.js
import React from 'react';

function TestApplicationsPage({onCreateNewTestApplication, onEditTestApplication}) {

  return (
    <div className="p-4">
      <h2>Test Applications</h2>
      <button className="btn btn-primary mb-3" onClick={onCreateNewTestApplication}>
        Create new Test Application
      </button>
      <button className="btn btn-primary mb-3" onClick={onEditTestApplication}>
        Edit Test Application
      </button>
    </div>
  );
}

export default TestApplicationsPage;
