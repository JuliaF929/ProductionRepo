// pages/TestApplicationsPage.js
import React, { useState, useEffect } from 'react';
import constants from '../constants';

function TestApplicationsPage({onCreateNewTestApplication, onEditTestApplication, onSelectTestApp}) {
  const [testApps, setTestApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Fetch test applications from server
    async function fetchTestApps() {
      const response = await fetch(`${constants.API_BASE}/test-applications`);
      const data = await response.json();
      setTestApps(data);
    }
    fetchTestApps();
  }, []);

  const handleEdit = (app) => {
    setSelectedId(app._id);
    onEditTestApplication(app);
    alert('Edit is not implemented yet, You can only view selected test application contents:\n ' + app.name);
  };

  const handleDelete = (app) => {
    alert('Delete is not implemented yet, sorry. Test application name selected: ' + app.name);
  };

  const handleRowClick = (app) => {
    setSelectedId(app._id); 
    if (onSelectTestApp) onSelectTestApp(app);
  };
  return (
    <div className="container mt-4">
      <h2>Test Applications</h2>
      <button className="btn btn-primary mb-3" onClick={onCreateNewTestApplication}>
        Create new Test Application
      </button>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>ECO#</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {testApps.map(app => (
              <tr
                key={app._id}
                className={selectedId === app._id ? 'table-primary' : ''}
                onClick={() => handleRowClick(app)}
                style={{ cursor: 'pointer' }}
              >
                <td>{app.name}</td>
                <td>{app.versionNumber}</td>
                <td>{app.ECONumber}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={e => { e.stopPropagation(); handleEdit(app); }}
                  >
                    <span class="material-symbols-outlined">
                      edit
                    </span>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => { e.stopPropagation(); handleDelete(app); }}
                  >
                    <span class="material-symbols-outlined">
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

export default TestApplicationsPage;
