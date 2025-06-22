import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DESCRIPTION_MAX_CHARS = 60;
const GENERAL_STRING_MAX_CHARS = 5;

const availableParametersTypes = ['string', 'double', 'integer'];

function ItemTypePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [SNPrefix, setSNPrefix] = useState('');
  const [selectedTestApps, setSelectedTestApps] = useState([]);
  //const [currentSelection, setCurrentSelection] = useState('');
  //const [allItemTypes, setAllItemTypes] = useState([]); 
  const { action } = useParams(); // "create" or "edit"
  const [testAppComponents, setTestAppComponents] = useState([]);
  const [parameterComponents, setParameterComponents] = useState([]);
  const navigate = useNavigate();

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

  const validateItemTypeData = (name, description, SNPrefix) => {

    //validations before pushing to the server
    if (!name) {
      return { isValid: false, message: 'Item Type Name is required.' };
    }

    if (name.length > GENERAL_STRING_MAX_CHARS )  {
      return { isValid: false, message: 'Item Type name has to be shorter than ' + GENERAL_STRING_MAX_CHARS + ' characters.' };
    }

    if (description.length > DESCRIPTION_MAX_CHARS)  {
     return { isValid: false, message: 'Item Type Description has to be shorter than ' + DESCRIPTION_MAX_CHARS + 'characters.' };
   }
   if (SNPrefix.length > GENERAL_STRING_MAX_CHARS )  {
    return { isValid: false, message: 'Item Type SN Prefix has to be shorter than ' + GENERAL_STRING_MAX_CHARS + 'characters.'};
  }

  return {isValid: true, message: ''};
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

    console.log("before handleAddItemTypeOnServer, new item type name = " + name);
    const { isValid, message } = validateItemTypeData(name, description, SNPrefix);
    if (isValid == false) {
        alert(message);
        console.log(message);
    }

    handleAddItemTypeOnServer(name);
    //return to previous screen
    navigate(-1);
    console.log("after handleAddItemTypeOnServer, new item type name = " + name);

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

  const onAddAnotherParameter = () => {
    setParameterComponents(prev => [
      ...prev,
      {
        id: Date.now(), // or some unique id
        selectedParameterType: ''
      }
    ]);
  };

  const removeTestAppComponent = (id) => {
    setTestAppComponents(prev => prev.filter(app => app.id !== id));
  };

  const removeParameterComponent = (id) => {
    setParameterComponents(prev => prev.filter(param => param.id !== id));
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

  <hr style={{ borderTop: '3px solid green' }} />

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
    onRemoveTestApplication={() => removeTestAppComponent(app.id)}
  />
))}


<button className="btn btn-secondary" onClick={onAddAnotherTestApp}>Add Another Test App</button>

<hr style={{ borderTop: '3px solid magenta' }} />

{parameterComponents.map((param) => (
  <ParameterComponent
    key={param.id}
    availableParametersTypes={availableParametersTypes}
    selectedParameterType={param.selectedParameterType}
    onSelectParameterType={() => {}}
    onRemoveParameter={() => removeParameterComponent(param.id)}
  />
))}

<button className="btn btn-secondary" onClick={onAddAnotherParameter}>Add Another Parameter</button>

<hr style={{ borderTop: '3px solid blue' }} />


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
  onSelectAppVersion,
  onRemoveTestApplication
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

      <button className="btn btn-secondary" onClick={onRemoveTestApplication}>Remove</button>
    </div>
  );
}

function ParameterComponent({
  availableParametersTypes, selectedParameterType, onSelectParameterType, onRemoveParameter
}) 
{

  return (
    <div className="mb-3">
      <label className="form-label">Parameter</label>
      <input
        type="text"
        className="form-control"
        id="ParameterName"
      />

      <select
        className="form-select"
        value={selectedParameterType}
        onChange={(e) => onSelectParameterType(e.target.value)}>
        <option value="">-- Select Parameter Type --</option>
        {availableParametersTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <input
        type="text"
        className="form-control"
        id="ParameterValue"
      />

      <button className="btn btn-secondary" onClick={onRemoveParameter}>Remove</button>
    </div>
  );
}

export default ItemTypePage;
