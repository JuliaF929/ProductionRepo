// pages/ItemTypesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import constants from '../constants';

function ItemTypesPage({onCreateNewItemType, onEditItemType, onSelectItemType}) {
  const navigate = useNavigate();
  const [itemTypes, setItemTypes] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');


  useEffect(() => {
    // Fetch item types from server
    async function fetchItemTypes() {
      console.log(`The API_BASE is ${constants.API_BASE}`);
      const response = await fetch(`${constants.API_BASE}/item-types`);
      const data = await response.json();
      setItemTypes(data);
    }
    fetchItemTypes();
  }, []);

  const handleEdit = (itemType) => {
    setSelectedId(itemType._id);
    onEditItemType(itemType);
    alert('Edit is not implemented yet, You can only view selected item type contents:\n ' + itemType.name);
  };  

  const handleDelete = (itemType) => {
    alert('Delete is not implemented yet, sorry. Item type name selected: ' + itemType.name);
  };

  const handleRowClick = (itemType) => {
    setSelectedId(itemType._id); 
    if (onSelectItemType) onSelectItemType(itemType);
  };

  const filteredItemTypes = itemTypes.filter(item =>
    (item.name?.toLowerCase() || '').includes(filterName.toLowerCase()) &&
    (item.description?.toLowerCase() || '').includes(filterDescription.toLowerCase())
  );

  const selectedItemTypeIsVisible = selectedId
  ? filteredItemTypes.some(itemType => itemType._id === selectedId)
  : false;

  if (selectedId && !selectedItemTypeIsVisible) {
    // selection disappeared due to filtering
    setSelectedId(null);
    onSelectItemType(null); // tell HomePage to clear right panel
  }
  
  return (
    <div className="container mt-4">
      <h2>Item Types</h2>
      <button className="btn btn-primary mb-3" onClick={onCreateNewItemType}>
        Create new Item Type
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
            placeholder="Filter by description..."
            value={filterDescription}
            onChange={e => setFilterDescription(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setFilterName(''); setFilterDescription(''); }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <small className="text-muted">
            Presented {filteredItemTypes.length} of {itemTypes.length} item types
          </small>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredItemTypes.map(itemType => (
              <tr
                key={itemType._id}
                className={selectedId === itemType._id ? 'table-primary' : ''}
                onClick={() => handleRowClick(itemType)}
                style={{ cursor: 'pointer' }}
              >
                <td>{itemType.name}</td>
                <td>{itemType.description}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={e => { e.stopPropagation(); handleEdit(itemType); }}
                  >
                    <span className="material-symbols-outlined">
                      edit
                    </span>  
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => { e.stopPropagation(); handleDelete(itemType); }}
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

export default ItemTypesPage;
