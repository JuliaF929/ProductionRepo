// src/components/VerticalMenu.js
import React from 'react';

const menuItems = [
  { label: 'Item Types', key: 'item-types-page' },
  { label: 'Test Applications', key: 'test-applications-page' },
  { label: 'About', key: 'about-page' }
];

function VerticalMenu({ selected, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      borderRight: '1px solid #ccc',
      minWidth: 180,
      background: '#f8f8f8'
    }}>
      {menuItems.map(item => (
        <button
          key={item.key}
          style={{
            padding: '1em',
            background: selected === item.key ? '#e0e0e0' : 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: selected === item.key ? 'bold' : 'normal'
          }}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default VerticalMenu;