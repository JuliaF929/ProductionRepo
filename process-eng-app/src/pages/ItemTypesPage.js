// pages/ItemTypesPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ItemTypesPage({onCreateNewItemType, onEditItemType}) {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2>Item Types</h2>
      <button className="btn btn-primary mb-3" onClick={onCreateNewItemType}>
        Create new Item Type
      </button>
      <button className="btn btn-primary mb-3" onClick={onEditItemType}>
        Edit Item Type
      </button>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/item-types/getAllItemTypes')}>
        Get All Item Types
      </button>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/item-types/deleteItemType')}>
        Delete Item Type
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item Type Name</th>
          </tr>
        </thead>
        <tbody>
          {/* Replace with real data */}
          <tr>
            <td>1</td>
            <td>Example Type</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ItemTypesPage;
