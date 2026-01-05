import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextComponent from '../components/TextComponent';
import constants from '../constants';
import validator from "validator";
import MultiSelectChips from '../components/MultiSelectChips'


function UserDetailsPage({action, userData, availableRoles}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const addTriggered = useRef(false);


    // Update the fields when a new userData is passed in:
    useEffect(() => {
      //console.log('userData: ' + JSON.stringify(userData, null, 2));
      if (userData) {
        setName(userData.name || '');
        setEmail(userData.email || '');
        setRoles(Array.isArray(userData.roles) ? userData.roles : []);
        setStatus(userData.status || '');
        setInvitedBy(userData.invitedBy || '');
      }
    }, [userData]);

  const clearFields = () => {
    setName('');
    setEmail('');
    setRoles([]);
    setStatus('');
    setInvitedBy('');
  };

    const validateUserData = (name, email) => {

      //validations before pushing to the server
      if (!name) {
        return { isValid: false, message: 'User Name is required.' };
      }
  
      if (name.length > constants.GENERAL_STRING_MAX_CHARS )  {
        return { isValid: false, message: 'User name has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.' };
      }

      if (email.length > constants.GENERAL_STRING_MAX_CHARS )  {
        return { isValid: false, message: 'User email has to be shorter than ' + constants.GENERAL_STRING_MAX_CHARS + ' characters.' };
      }
  
      if (!validator.isEmail(email)) {
        return { isValid: false, message: 'User email validation failed.' };
      }
  
    return {isValid: true, message: ''};
  };


  const handleInviteUserOnServer = async (name, email, roles, invitedBy) => {
    try {
      
      if (addTriggered.current) 
        {
          console.log('addTriggered.current is true, returning');
          return; // Prevent second call  
        }

      addTriggered.current = true;


      console.log('Start adding user to the server (database)...');

      const response = await fetch(`${constants.API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          roles: roles,
          invitedBy: invitedBy,
        }),
      });
  
      // Print the raw response text
      const rawBody = await response.text();
      console.log('Raw response body:', rawBody);

      if (!response.ok) {
        const errStr = `Failed to add user with name ${name}, email ${email}, status: ${response.status}`;
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
    
  // Invite user
  const handleInviteUser = async () => {

    document.body.style.cursor = "wait";

    console.log(`before handleInviteUserOnServer, new user name: ${name}, email: ${email}.`);  
    const { isValid, message } = validateUserData(name, email);
    if (isValid == false) {
        alert(message);
        console.log(message);
        document.body.style.cursor = "default";
        return;
    }

    await handleInviteUserOnServer(name, email, roles, "sysAdminName" /*TODO: change to the active user*/);

    addTriggered.current = false;

    clearFields();
   
    console.log(`after handleInviteUserOnServer, new user name = ${name}`);

    //by refreshing we do:
    //add invited user to the list of users
    //select the invited user in the list of users (TODO:?)
    //selected user's data is shown at the  right as usual (TODO:?)
    window.location.reload(true);

    document.body.style.cursor = "default";

  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {action === 'invite' ? 'Invite User' : action === 'edit' ? 'Edit User' : 'View User'}
      </h2>

  <div className="mb-4">
    <TextComponent text={name} onChange={setName} label={'User Name'} isDisabled={action === 'view'}/>
  </div>

  <div className="mb-4">
    <TextComponent text={email} onChange={setEmail} label={'Email'} isDisabled={action === 'view'}/>
  </div>

  <label className="form-label">Roles</label>
      <MultiSelectChips
        options={Array.isArray(availableRoles) ? availableRoles : []}
        value={roles}
        onChange={setRoles}
        placeholder="Select roles..."
        disabled={action === 'view'}
        searchable={false}   // ✅ no typing, only dropdown selection
      />

  {/* show status and invitedBy only for view or edit, but always disabled*/}
  {action !== "invite" && (
    <>
      <div className="mb-4">
        <TextComponent text={status} onChange={setStatus} label={'Status'} isDisabled={action === 'view'}/>
      </div>

      <div className="mb-4">
        <TextComponent text={invitedBy} onChange={setInvitedBy} label={'Invited By'} isDisabled={action === 'view'}/>
      </div>
    </>
  )}

{action !== 'view' && (
  <div className="mb-5">
    <button
      className="btn btn-success"
      onClick={handleInviteUser}>{action === 'invite' ? 'Invite User' : 'Edit User'}
    </button>
  </div>
)}
  </div>
  );
}

export default UserDetailsPage;