import React, { useState, useEffect } from 'react';
import constants from '../constants';

function RunDetailsPage({run}) {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        fetch(`${constants.API_BASE}/item-actions-history/${run.itemSerialNumber}/${run.actionName}/${run.endExecutionDateTimeUTC}`)
          .then(res => res.json())
          .then(data => setRows(data))
          .catch(err => console.error(`Failed to load run's parameters for itemSN ${run.itemSerialNumber}, actionName ${run.actionName}, endExecutionDateTimeUTC ${run.endExecutionDateTimeUTC}, error: ${err}`));
      }, []);

  return (
    
<div>
      <h2>Run&apos;s parameters</h2>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.name}</td>
              <td>{String(row.value)}</td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RunDetailsPage;