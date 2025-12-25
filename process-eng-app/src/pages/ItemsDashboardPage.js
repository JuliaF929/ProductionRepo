// pages/ItemsDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import constants from '../constants';

function ItemsDashboardPage({onSelectItem}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [filterSerialNumber, setFilterSerialNumber] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCreationDate, setFilterCreationDate] = useState('');
  const [filterReleaseDate, setFilterReleaseDate] = useState('');


  useEffect(() => {
    // Fetch items from server
    //contents of the returned items:
    //- serialNumber
    //- type
    //- creationdate
    //- releaseDate

    console.log("ItemsDashboardPage: useEffect main fetch");

    async function fetchItems() {
      console.log(`The API_BASE is ${constants.API_BASE}`);
      const response = await fetch(`${constants.API_BASE}/items`);
      const data = await response.json();
      setItems(data);
    }
    fetchItems();
  }, []);


  const handleRowClick = (item) => {
    console.log(`ItemsDashboardPage: handleRowClick for item._id=${item._id}`);
    setSelectedId(item._id); 
    if (onSelectItem) onSelectItem(item);
  };

  const filteredItems = items.filter(item =>
    (item.serialNumber?.toLowerCase() || '').includes(filterSerialNumber.toLowerCase()) && 
    (item.type?.toLowerCase() || '').includes(filterType.toLowerCase()) && 
    (item.creationdate?.toLowerCase() || '').includes(filterCreationDate.toLowerCase()) &&
    (item.releasedate?.toLowerCase() || '').includes(filterReleaseDate.toLowerCase())
  );

  const selectedItemIsVisible = selectedId
  ? filteredItems.some(item => item._id === selectedId)
  : false;

  if (selectedId && !selectedItemIsVisible) {
    // selection disappeared due to filtering
    setSelectedId(null);
    onSelectItem(null); // tell HomePage to clear right panel
  }
  
  return (
    <div className="container mt-4">
      <h2>Items Dashboard</h2>

      <div className="row mb-3">
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by SN..."
            value={filterSerialNumber}
            onChange={e => setFilterSerialNumber(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by type..."
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by creation date..."
            value={filterCreationDate}
            onChange={e => setFilterCreationDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by release date..."
            value={filterReleaseDate}
            onChange={e => setFilterReleaseDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setFilterSerialNumber(''); setFilterType(''); setFilterCreationDate(''); setFilterReleaseDate(''); }}  
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <small className="text-muted">
            Presented {filteredItems.length} of {items.length} items
          </small>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Type</th>
              <th>Creation Date</th>
              <th>Release Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr
                key={item._id}
                className={selectedId === item._id ? 'table-primary' : ''}
                onClick={() => handleRowClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <td>{item.serialNumber}</td>
                <td>{item.type}</td>
                <td>{item.creationdate}</td>
                <td>{item.releasedate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItemsDashboardPage;
