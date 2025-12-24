import React, { useState, useEffect } from 'react';
import constants from '../constants';


function ItemDetailsPage({item}) {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        fetch(`${constants.API_BASE}/items/${item.serialNumber}`)
          .then(res => res.json())
          .then(data => setRows(data))
          .catch(err => console.error(`Failed to load item's parameters for itemSN ${item.serialNumber}, error: ${err}`));
      }, []);

  return (
    
<div>
      <h2>Item&apos;s parameters</h2>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Default Value</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.name}</td>
              <td>{String(row.defaultValue)}</td>
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

export default ItemDetailsPage;