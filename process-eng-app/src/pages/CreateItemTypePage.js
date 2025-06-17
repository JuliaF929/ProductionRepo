// pages/CreateItemTypePage.js
import React, { useState } from 'react';

const mockTestApps = ['App Alpha', 'App Beta', 'App Gamma']; // replace with real data later

function CreateItemTypePage() {
  const [name, setName] = useState('');
  const [selectedTestApps, setSelectedTestApps] = useState([]);
  const [currentSelection, setCurrentSelection] = useState('');

  const addTestApp = () => {
    if (currentSelection && !selectedTestApps.includes(currentSelection)) {
      setSelectedTestApps([...selectedTestApps, currentSelection]);
    }
  };

  return (
    <div className="container mt-4">
  <h2 className="mb-4">Create New Item Type</h2>

  {/* Item Type Name */}
  <div className="mb-3">
    <label htmlFor="itemTypeName" className="form-label">Item Type Name</label>
    <input
      type="text"
      className="form-control"
      id="itemTypeName"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>

  {/* Combo Box and Add Button */}
  <div className="mb-3">
    <label htmlFor="testAppSelect" className="form-label">Add Test Application</label>
    <div className="d-flex gap-2">
      <select
        className="form-select"
        id="testAppSelect"
        value={currentSelection}
        onChange={(e) => setCurrentSelection(e.target.value)}
      >
        <option value="">-- Select Test Application --</option>
        {mockTestApps.map(app => (
          <option key={app} value={app}>{app}</option>
        ))}
      </select>
      <button className="btn btn-secondary" onClick={addTestApp}>Add</button>
    </div>
  </div>

  {/* Associated Test Applications */}
  <h5 className="mt-4 mb-2">Associated Test Applications:</h5>
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>#</th>
        <th>Test Application Name</th>
      </tr>
    </thead>
    <tbody>
      {selectedTestApps.map((app, index) => (
        <tr key={app}>
          <td>{index + 1}</td>
          <td>{app}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}

export default CreateItemTypePage;
