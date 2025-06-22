import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function ItemTypePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [SNPrefix, setSNPrefix] = useState('');
  const [selectedTestApps, setSelectedTestApps] = useState([]);
  const [currentSelection, setCurrentSelection] = useState('');
  const [allItemTypes, setAllItemTypes] = useState([]); 
  const { action } = useParams(); // "create" or "edit"
  const [testAppComponents, setTestAppComponents] = useState([
    {
      id: 1,
      selectedAppName: '',
      selectedAppVersion: ''
    }
  ]);


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
  
  //currently mocked function, shall be replaced by 
  //getting real test application names and versions from the server
  const GetAllTestApplicationsForItemTypeFromServer = (itemTypeName) => {
    return [
      { "appName": "Analyzer", "version": "1.0.0" },
      { "appName": "Analyzer", "version": "1.0.1" },
      { "appName": "Runner", "version": "2.3.0" },
      { "appName": "Analyzer", "version": "1.2.0" }
    ];
  };

  // Create/Edit item type and return to prev. screen
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

  const allTestApplicationsForItemType = GetAllTestApplicationsForItemTypeFromServer(action);

  const onAddAnotherTestApp = () => {
    setTestAppComponents(prev => [
      ...prev,
      {
        id: Date.now(), // or some unique id
        selectedAppName: '',
        selectedAppVersion: ''
      }
    ]);
  };

  return (
    <div className="container mt-4">
  <h2 className="mb-4">{action === 'create' ? 'Create Item Type' : 'Edit Item Type'}</h2>

  <div className="mb-4">
    <ItemTypeForm name={name} onNameChange={setName} label={'Item Type Name'}/>
  </div>

  <div className="mb-4">
    <ItemTypeForm name={description} onNameChange={setDescription} label={'Item Type Description'}/>
  </div>

  <div className="mb-4">
    <ItemTypeForm name={SNPrefix} onNameChange={setSNPrefix} label={'Item Serial Number Prefix'}/>
  </div>

  {testAppComponents.map((app, index) => (
  <TestApplicationComponent
    key={app.id}
    testAppsFromServer={allTestApplicationsForItemType}
    selectedAppName={app.selectedAppName}
    selectedAppVersion={app.selectedAppVersion}
    onSelectAppName={(newName) => {
      const updated = [...testAppComponents];
      updated[index].selectedAppName = newName;
      updated[index].selectedAppVersion = ""; // reset version
      setTestAppComponents(updated);
    }}
    onSelectAppVersion={(newVersion) => {
      const updated = [...testAppComponents];
      updated[index].selectedAppVersion = newVersion;
      setTestAppComponents(updated);
    }}
  />
))}

  <button className="btn btn-secondary" onClick={onAddAnotherTestApp}>Add Another Test App</button>

  <div className="mb-5">
    <button
      className="btn btn-success"
      onClick={handleAddItemType}>{action === 'create' ? 'Create Item Type' : 'Edit Item Type'}
    </button>
  </div>

</div>

  );
}

function ItemTypeForm({ name, onNameChange, label }) {
  return (
    <div className="mb-3">
      <label htmlFor="itemTypeName" className="form-label">{label}</label>
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

function TestApplicationComponent({
  testAppsFromServer,
  selectedAppName,
  selectedAppVersion,
  onSelectAppName,
  onSelectAppVersion
}) {
  const appNames = [...new Set(testAppsFromServer.map(app => app.appName))];
  const versionsForSelectedApp = testAppsFromServer
    .filter(app => app.appName === selectedAppName)
    .map(app => app.version);

  return (
    <div className="mb-3">
      <label className="form-label">Test Application</label>
      <select
        className="form-select"
        value={selectedAppName}
        onChange={(e) => onSelectAppName(e.target.value)}
      >
        <option value="">-- Select Test Application --</option>
        {appNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      <label className="form-label mt-2">Test Application Version#</label>
      <select
        className="form-select"
        value={selectedAppVersion}
        onChange={(e) => onSelectAppVersion(e.target.value)}
        disabled={!selectedAppName}
      >
        <option value="">-- Select Test Application Version# --</option>
        {versionsForSelectedApp.map(ver => (
          <option key={ver} value={ver}>{ver}</option>
        ))}
      </select>
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


export default ItemTypePage;
