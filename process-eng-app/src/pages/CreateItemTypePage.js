import React, { useState } from 'react';

// Mock test applications
const mockTestApps = ['App Alpha', 'App Beta', 'App Gamma'];

function CreateItemTypePage() {
  const [name, setName] = useState('');
  const [selectedTestApps, setSelectedTestApps] = useState([]);
  const [currentSelection, setCurrentSelection] = useState('');
  const [allItemTypes, setAllItemTypes] = useState([]); 


  const handleAddItemTypeOnServer = async (itemTypeName) => {
    try {
      const response = await fetch('http://localhost:5000/item-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemTypeName,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add item type with name ' + itemTypeName);
      }
  
      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  // Add current item type to the list
  const handleAddItemType = () => {
    if (!name) {
      alert('Item Type Name is required.');
      console.log("Item Type Name is required.");
      return;
    }

    if (selectedTestApps.length === 0) {
      alert('Please select at least one Test Application.');
      return;
    }

    const newItem = {
      name,
      apps: [...selectedTestApps],
    };

    setAllItemTypes([...allItemTypes, newItem]);

    console.log("before handleAddItemTypeOnServer, new item type name = " + name);
    handleAddItemTypeOnServer(name);
    console.log("after handleAddItemTypeOnServer, new item type name = " + name);

    // Clear form
    setName('');
    setSelectedTestApps([]);
    setCurrentSelection('');
  };

  const addTestApp = () => {
    if (currentSelection && !selectedTestApps.includes(currentSelection)) {
      setSelectedTestApps([...selectedTestApps, currentSelection]);
    }
  };

  return (
    <div className="container mt-4">
  <h2 className="mb-4">Create New Item Type</h2>

  <div className="mb-4">
    <ItemTypeForm name={name} onNameChange={setName} />
  </div>

  <div className="mb-4">
    <TestAppSelector
      testApps={mockTestApps}
      selectedApp={currentSelection}
      onSelectApp={setCurrentSelection}
      onAdd={addTestApp}
    />
  </div>

  <div className="mb-4">
    <AssociatedAppsTable apps={selectedTestApps} />
  </div>

  <div className="mb-5">
    <button
      className="btn btn-success"
      onClick={handleAddItemType}
    >
      Add Item Type
    </button>
  </div>

  <div className="mb-5">
    <ExistingItemTypesTable items={allItemTypes} />
  </div>
</div>

  );
}

function ItemTypeForm({ name, onNameChange }) {
  return (
    <div className="mb-3">
      <label htmlFor="itemTypeName" className="form-label">Item Type Name</label>
      <input
        type="text"
        className="form-control"
        id="itemTypeName"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
  );
}

function TestAppSelector({ testApps, selectedApp, onSelectApp, onAdd }) {
  return (
    <div className="mb-3">
      <label htmlFor="testAppSelect" className="form-label">Add Test Application</label>
      <div className="d-flex gap-2">
        <select
          className="form-select"
          id="testAppSelect"
          value={selectedApp}
          onChange={(e) => onSelectApp(e.target.value)}
        >
          <option value="">-- Select Test Application --</option>
          {testApps.map(app => (
            <option key={app} value={app}>{app}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={onAdd}>Add</button>
      </div>
    </div>
  );
}

function AssociatedAppsTable({ apps }) {
  if (apps.length === 0) return null;

  return (
    <>
      <h5 className="mt-4 mb-2">Associated Test Applications:</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Test Application Name</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app, index) => (
            <tr key={app}>
              <td>{index + 1}</td>
              <td>{app}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ExistingItemTypesTable({ items }) {
  if (items.length === 0) return null;

  return (
    <>
      <h5 className="mt-5 mb-2">All Existing Item Types:</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Type Name</th>
            <th>Associated Test Apps</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.apps.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default CreateItemTypePage;
