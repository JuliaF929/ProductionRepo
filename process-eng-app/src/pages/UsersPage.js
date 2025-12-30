// pages/UsersPage.js
import React, { useState, useEffect } from 'react';
import constants from '../constants';
 

function UsersPage({onInviteNewUser, onEditUser, onSelectUser}) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRoles, setFilterRoles] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterInvitedBy, setFilterInvitedBy] = useState('');
  const [roles, setRoles] = useState([]);


  useEffect(() => {
    // Fetch users from server
    async function fetchUsers() {
      const response = await fetch(`${constants.API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch roles from server
    async function fetchRoles() {
      const response = await fetch(`${constants.API_BASE}/users/roles`);
      const data = await response.json();
      setRoles(data);
    }
    fetchRoles();
  }, []);

  const handleEdit = (user) => {
    setSelectedId(user._id);
    onEditUser(user);
    alert('Edit is not implemented yet, You can only view selected user contents:\n ' + user.name);
  };

  const handleDelete = (user) => {
    alert('Delete is not implemented yet, sorry. User name selected: ' + user.name);
  };

  const handleRowClick = (user) => {
    setSelectedId(user._id); 
    if (onSelectUser) onSelectUser(user);
  };

  const filteredUsers = users.filter(user => {
    const rolesText = Array.isArray(user.roles) ? user.roles.join(", ") : (user.roles || "");

    return (user.name?.toLowerCase() || '').includes(filterName.toLowerCase()) &&
    (user.email?.toLowerCase() || '').includes(filterEmail.toLowerCase()) &&
    (rolesText?.toLowerCase() || '').includes(filterRoles.toLowerCase()) &&
    (user.status?.toLowerCase() || '').includes(filterStatus.toLowerCase()) &&
    (user.invitedBy?.toLowerCase() || '').includes(filterInvitedBy.toLowerCase())
});

  const selectedUserIsVisible = selectedId
  ? filteredUsers.some(user => user._id === selectedId)
  : false;

  if (selectedId && !selectedUserIsVisible) {
    // selection disappeared due to filtering
    setSelectedId(null);
    onSelectUser(null); // tell HomePage to clear right panel
  }
  
  return (
    <div className="container mt-4">
      <h2>Users</h2>
      <button className="btn btn-primary mb-3" onClick={onInviteNewUser}>
        Invite new user
      </button>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by name..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by email..."
            value={filterEmail}
            onChange={e => setFilterEmail(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by roles..."
            value={filterRoles}
            onChange={e => setFilterRoles(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by status..."
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by invited by..."
            value={filterInvitedBy}
            onChange={e => setFilterInvitedBy(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setFilterName(''); setFilterEmail(''); setFilterRoles(''); setFilterStatus(''); setFilterInvitedBy(''); }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <small className="text-muted">
            Presenting {filteredUsers.length} of {users.length} users
        </small>
        </div>
      </div>


      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>eMail</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Invited By</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr
                key={user._id}
                className={selectedId === user._id ? 'table-primary' : ''}
                onClick={() => handleRowClick(user)}
                style={{ cursor: 'pointer' }}
              >
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.roles}</td>
                <td>{user.status}</td>
                <td>{user.invitedBy}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={e => { e.stopPropagation(); handleEdit(user); }}
                  >
                    <span className="material-symbols-outlined">
                      edit
                    </span>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => { e.stopPropagation(); handleDelete(user); }}
                  >
                    <span className="material-symbols-outlined">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
