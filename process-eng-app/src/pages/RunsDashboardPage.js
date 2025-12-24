// pages/RunsDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import constants from '../constants';

function RunsDashboardPage({onSelectRun}) {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);

  const [filteritemSerialNumber, setFilteritemSerialNumber] = useState('');
  const [filteritemType, setFilteritemType] = useState('');
  const [filteractionName, setFilteractionName] = useState('');
  const [filterresult, setFilterresult] = useState('');


  useEffect(() => {
    // Fetch runs from server
    //contents of the returned runs:
    //- itemSerialNumber
    //- itemType
    //- actionName
    //- actionSWVersion - //skipped
    //- calibrixOperatorAppSWVersion - skipped
    //- startExecutionDateTimeUTC - skipped
    //- endExecutionDateTimeUTC - skipped
    //- result
    //- errorMsg - skipped
    //- stationName - skipped
    //- siteName - skipped
    //- operatorName - skipped

    async function fetchRuns() {
      console.log(`The API_BASE is ${constants.API_BASE}`);
      const response = await fetch(`${constants.API_BASE}/item-actions-history`);
      const data = await response.json();
      setRuns(data);
    }
    fetchRuns();
  }, []);


  const handleRowClick = (run) => {
    setSelectedId(run._id); 
    if (onSelectRun) onSelectRun(run);
  };

  const filteredRuns = runs.filter(run =>
    (run.itemSerialNumber?.toLowerCase() || '').includes(filteritemSerialNumber.toLowerCase()) && 
    (run.itemType?.toLowerCase() || '').includes(filteritemType.toLowerCase()) && 
    (run.actionName?.toLowerCase() || '').includes(filteractionName.toLowerCase()) &&
    (run.result?.toLowerCase() || '').includes(filterresult.toLowerCase()) 
   );
  
  return (
    <div className="container mt-4">
      <h2>Runs Dashboard</h2>

      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by item SN..."
            value={filteritemSerialNumber}
            onChange={e => setFilteritemSerialNumber(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by item type..."
            value={filteritemType}
            onChange={e => setFilteritemType(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by action name..."
            value={filteractionName}
            onChange={e => setFilteractionName(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by result..."
            value={filterresult}
            onChange={e => setFilterresult(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setFilteritemSerialNumber(''); setFilteritemType(''); setFilteractionName(''); setFilterresult(''); }}  
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <small className="text-muted">
            Presented {filteredRuns.length} of {runs.length} items
          </small>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Item Serial Number</th>
              <th>Item Type</th>
              <th>Action Name</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map(run => (
              <tr
                key={run._id}
                className={selectedId === run._id ? 'table-primary' : ''}
                onClick={() => handleRowClick(run)}
                style={{ cursor: 'pointer' }}
              >
                <td>{run.itemSerialNumber}</td>
                <td>{run.itemType}</td>
                <td>{run.actionName}</td>
                <td>{run.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RunsDashboardPage;
