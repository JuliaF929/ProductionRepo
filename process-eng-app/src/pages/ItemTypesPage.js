// pages/ItemTypesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import constants from '../constants';

function ItemTypesPage({onCreateNewItemType, onEditItemType, onSelectItemType}) {
  const navigate = useNavigate();
  const [itemTypes, setItemTypes] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  

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

  return (
    <div className="container mt-4">
      <h2>Item Types</h2>
      <button className="btn btn-primary mb-3" onClick={onCreateNewItemType}>
        Create new Item Type
      </button>

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
            {itemTypes.map(itemType => (
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
                    className="btn btn-sm btn-warning"
                    onClick={e => { e.stopPropagation(); handleEdit(itemType); }}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={e => { e.stopPropagation(); handleDelete(itemType); }}
                  >
                    Delete
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
