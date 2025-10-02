import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TextComponent from '../components/TextComponent';
import constants from '../constants';

const availableParametersTypes = ['string', 'double', 'integer'];

function ItemTypePage({action, itemTypeData}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [SNPrefix, setSNPrefix] = useState('');
  const [parameterDefaults, setParameterDefaults] = useState([]);
  const [selectedTestApps, setSelectedTestApps] = useState([]);
  //const [currentSelection, setCurrentSelection] = useState('');
  //const [allItemTypes, setAllItemTypes] = useState([]); 
  const [testAppComponents, setTestAppComponents] = useState([]);
  const [allExistingTestApplications, setAllExistingTestApplications] = useState([]);
  //const navigate = useNavigate();
  const deleteTriggered = useRef(false);
  const getAllTriggered = useRef(false);
  const addTriggered = useRef(false);


  useEffect(() => {
    async function fetchTestApps() {
      const data = await GetAllExistingTestApplicationsFromServer();
      setAllExistingTestApplications(data);
    }
    fetchTestApps();
  }, []);

  useEffect(() => {
    if (itemTypeData) {
      setName(itemTypeData.name);
      setDescription(itemTypeData.description);
      setSNPrefix(itemTypeData.SNPrefix);
      setParameterDefaults(itemTypeData.parameterDefaults); 
      setTestAppComponents(itemTypeData.testApplications);
    }
  }, [itemTypeData]);

  const clearFields = () => {
    setName('');
    setDescription('');
    setSNPrefix('');
    setParameterDefaults([]);      // <-- This removes all parameterDefaults
    setTestAppComponents([]);      // <-- This removes all testAppComponents
  };

  const handleDeleteItemTypeOnServer = async (uuid) => {
    try {
      if (deleteTriggered.current) return; // Prevent second call
        
      deleteTriggered.current = true;

      console.log(`Got ${uuid} for deletion in handleDeleteItemTypeOnServer`);
      console.log(`The API_BASE is {constants.API_BASE}`);
      const response = await fetch(`${constants.API_BASE}/item-types/${uuid}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete item type with ${uuid}`);
      }
  
      const itemTypes = await response.json();
      console.log(`Item type ${uuid} was successfully deleted.`);
  
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  if (action === "deleteItemType")
  {
    handleDeleteItemTypeOnServer('ItemTypeXID5');
    return;
  }

  const handleGetAllItemTypesOnServer = async () => {
    try {
      if (getAllTriggered.current) return; // Prevent second call
        
      getAllTriggered.current = true;

      const response = await fetch(`${constants.API_BASE}/item-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to get item types');
      }
  
      const itemTypes = await response.json();
      console.log(itemTypes);
  
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  if (action === "getAllItemTypes")
  {
    handleGetAllItemTypesOnServer();
    return;
  }

  const handleAddItemTypeOnServer = async (name, description, SNPrefix, parameterDefaults, testApplications) => {
    try {
      
      if (addTriggered.current) return; // Prevent second call  

      addTriggered.current = true;

      console.log('parameterDefaults: ' + JSON.stringify(parameterDefaults, null, 2));
      console.log('testApplications: ' + JSON.stringify(testApplications, null, 2));
  
      const response = await fetch(`${constants.API_BASE}/item-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          description: description,
          SNPrefix: SNPrefix,
          parameterDefaults: parameterDefaults, //Sending full parameter array,
          testApplications: testApplications //Sending full test application array
        }),
      });
  
      // Print the raw response text
      const rawBody = await response.text();
      console.log('Raw response body:', rawBody);

      if (!response.ok) {
        throw new Error('Failed to add item type with name ' + name);
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

  const validateParameters = (parameterDefaults) => {
    return parameterDefaults.every(p => {
      if (p.type === "integer") {
        // must be a valid integer
        return Number.isInteger(Number(p.defaultValue));
      }
      if (p.type === "double") {
        // must be a valid number (float or int)
        return !isNaN(p.defaultValue) && p.defaultValue.toString().trim() !== "";
      }
      return true; // skip validation for other types
    });
  };

  const validateItemTypeData = (name, description, SNPrefix, parameterDefaults, testAppComponents) => {

    //validations before pushing to the server
    if (!name) {
      return { isValid: false, message: 'Item Type Name is required.' };
    }

    if (name.length > constants.GENERAL_STRING_MAX_CHARS )  {
      return { isValid: false, message: 'Item Type name has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.' };
    }

    if (description.length > constants.DESCRIPTION_MAX_CHARS)  {
     return { isValid: false, message: 'Item Type Description has to be shorter than ' + constants.DESCRIPTION_MAX_CHARS + ' characters.' };
   }
   if (SNPrefix.length > constants.SN_PREFIX_MAX_CHARS )  {
    return { isValid: false, message: 'Item Type SN Prefix has to be shorter than ' + constants.SN_PREFIX_MAX_CHARS + ' characters.'};
  }

   //Validation of all parameters
   
   //check that there are no duplicates of the name
   const names = parameterDefaults.map(p => p.name);
   const hasDuplicates = new Set(names).size !== names.length;

   if (hasDuplicates) {
    return { isValid: false, message: 'Parameters with same names are not allowed.' };
   }

   //check that parameters of type integer have only digits
   //check that parameters of type double have only digits and dot
   if (!validateParameters(parameterDefaults)) {
    return { isValid: false, message: "Some parameters with type 'integer'/'double' do not have a valid value." };
   }


   //Validation of all test applications
   //in test applications can be duplicates...

    return {isValid: true, message: ''};          
};
  
  //currently mocked function, shall be replaced by 
  //getting real test application names and versions from the server
  const GetAllExistingTestApplicationsFromServer = async () => {
    try {

      const response = await fetch(`${constants.API_BASE}/test-applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get test applications');
      }
  
      const testApplications = await response.json();
      console.log(JSON.stringify(testApplications, null, 2));
  
      const testAppsToShow = (testApplications || []).map(app => ({
        appName: app.name,
        version: app.versionNumber
      }));
      console.log(JSON.stringify(testAppsToShow, null, 2));
      return testAppsToShow;

  }
   catch (error) 
  {
    console.error('Error:', error);
    return [];
  }
  };

  // Create/Edit item type 
  const handleAddItemType = async () => {

    document.body.style.cursor = "wait";
    
    console.log("before handleAddItemTypeOnServer, new item type name = " + name + ' ' + description + ' ' + SNPrefix);
    const { isValid, message } = validateItemTypeData(name, description, SNPrefix, parameterDefaults, testAppComponents);
    if (isValid == false) {
        alert(message);
        console.log(message);
        document.body.style.cursor = "default";
        return;
    }

    await   handleAddItemTypeOnServer(name, description, SNPrefix, parameterDefaults, testAppComponents);

    addTriggered.current = false;

    clearFields();

    //TODO: add new item type to the list of item types
    //TODO: select the new item type in the list of item types
    //TODO: selected item type's data is shown at the  right as usual 
    console.log("after handleAddItemTypeOnServer, new item type name = " + name);

    //by refreshing we do:
    //add new item type to the list of item types
    //select the new item type in the list of item types (TODO:?)
    //selected item type's's data is shown at the  right as usual (TODO:?)
    window.location.reload(true);

    document.body.style.cursor = "default";

  };

  const onAddAnotherTestApp = () => {
    setTestAppComponents(prev => [
      ...prev,
      {
        id: Date.now(),
        selectedAppName: '',
        selectedAppVersion: ''
      }
    ]);
  };

  const onAddAnotherParameterDefault = () => {
    setParameterDefaults(prev => [
      ...prev,
      {
        id: Date.now(), // unique id only for frontend
        name: '', description: '', type: '', defaultValue: ''
      }
    ]);
  };

  const removeTestAppComponent = (id) => {
    setTestAppComponents(prev => prev.filter(app => app.id !== id));
  };

  const confirmTestApplication = (id) => {
    setTestAppComponents(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, confirmed: true }  // mark confirmed
          : app
      )
    );
  };

  const removeParameterDefault = (id) => {
    setParameterDefaults(prev => prev.filter(param => param.id !== id));
  };

  const confirmParameterDefault = (id) => {
    setParameterDefaults(prev => {
      const updated = prev.map(param => {
        if (param.id === id) {
                  
          //check if name is blank
          if (!param.name || param.name.trim() === "") {
            console.log("Parameter name cannot be blank.");
            alert("Parameter name cannot be blank.");
            return param; // don’t confirm
          }

          // validation for integer
          if (param.type === "integer" && !Number.isInteger(Number(param.defaultValue))) {
            console.log(`Parameter ${param.name} of type integer must have a valid integer value.`);
            alert(`Parameter ${param.name} of type integer must have a valid integer value.`);
            return param; // don’t confirm
          }
  
          // validation for double
          if (param.type === "double" && (isNaN(param.defaultValue) || param.defaultValue.toString().trim() === "")) {
            console.log(`Parameter "${param.name}" of type double must have a valid double value.`);
            alert(`Parameter "${param.name}" of type double must have a valid double value.`);
            return param; // don’t confirm
          }
  
          // ✅ valid → mark as confirmed
          return { ...param, confirmed: true };
        }
        return param;
      });
  
      return updated;
    });
  };
  

  const handleParameterDefaultChange = (id, field, value) => {
    const updated = (parameterDefaults || []).map(param =>
      param.id === id
        ? { ...param, [field]: value }
        : param
    );
    setParameterDefaults(updated);
  };

  return (
    <div className="container mt-4">
  <h2 className="mb-4">{action === 'create' ? 'Create Item Type' : action === 'edit' ? 'Edit Item Type' : 'View Item Type'}</h2>

  <div className="mb-4">
    <TextComponent text={name} onChange={setName} label={'Item Type Name'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={description} onChange={setDescription} label={'Item Type Description'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={SNPrefix} onChange={setSNPrefix} label={'Item Serial Number Prefix'} isDisabled={action === 'view'}/>
  </div>
  
  {action !== 'view' && (
  <div className="mb-5">
  <hr style={{ borderTop: '3px solid green' }} />

  {(testAppComponents || []).map((app, index) => (
  <TestApplicationComponent
    key={app.id}
    testAppsFromServer={allExistingTestApplications}
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
    onConfirmTestApplication={() => confirmTestApplication(app.id)}
  />
))}


<button className="btn btn-secondary" onClick={onAddAnotherTestApp}>Add Another Test App</button>

<hr style={{ borderTop: '3px solid magenta' }} />

{(parameterDefaults || []).map((param) => (
  <ParameterComponent
    key={param.id}
    id={param.id}
    availableParametersTypes={availableParametersTypes}
    selectedParameterType={param.selectedParameterType}
    onSelectParameterType={() => {}}
    onConfirmParameter={() => confirmParameterDefault(param.id)}
    onRemoveParameter={() => removeParameterDefault(param.id)}
    onChange={handleParameterDefaultChange}
  />
))}


<button className="btn btn-secondary" onClick={onAddAnotherParameterDefault}>Add Another Parameter</button>

<hr style={{ borderTop: '3px solid blue' }} />

    <button
      className="btn btn-success"
      onClick={handleAddItemType}>{action === 'create' ? 'Create Item Type' : 'Edit Item Type'}
    </button>
  </div>
)}


</div>

  );
}

function TestApplicationComponent({
  testAppsFromServer,
  selectedAppName,
  selectedAppVersion,
  onSelectAppName,
  onSelectAppVersion,
  onRemoveTestApplication,
  onConfirmTestApplication,
  onChange
}) {
  const appNames = [...new Set((testAppsFromServer || []).map(app => app.appName))];
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
        {(appNames || []).map(name => (
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
        {(versionsForSelectedApp || []).map(ver => (
          <option key={ver} value={ver}>{ver}</option>
        ))}
      </select>

      <button className="btn btn-secondary" onClick={onConfirmTestApplication}>Confirm</button>
      <button className="btn btn-secondary" onClick={onRemoveTestApplication}>Remove</button>
    </div>
  );
}

function ParameterComponent({
                              id, 
                              availableParametersTypes, 
                              selectedParameterType, 
                              onSelectParameterType, 
                              onConfirmParameter,
                              onRemoveParameter, 
                              onChange
}) 
{

  return (
    <div className="mb-3">
      <label className="form-label mt-2">Parameter Name</label>
      <input
        type="text"
        className="form-control"
        id="ParameterName"
        onChange={(e) => onChange(id, 'name', e.target.value)}
      />
      <label className="form-label mt-2">Parameter Description</label>
      <input
        type="text"
        className="form-control"
        id="ParameterDescription"
        onChange={(e) => onChange(id, 'description', e.target.value)}
      />

      <label className="form-label mt-2">Parameter Type</label>
      <select
        className="form-select"
        value={selectedParameterType}
        onChange={(e) => onChange(id, 'type', e.target.value)}
        >
        <option value="">-- Select Parameter Type --</option>
        {(availableParametersTypes || []).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <label className="form-label mt-2">Parameter Default Value</label>
      <input
        type="text"
        className="form-control"
        id="ParameterValue"
        onChange={(e) => onChange(id, 'defaultValue', e.target.value)}
      />

      <button className="btn btn-secondary" onClick={onConfirmParameter}>Confirm</button>
      <button className="btn btn-secondary" onClick={onRemoveParameter}>Remove</button>
    </div>
  );
}

export default ItemTypePage;
