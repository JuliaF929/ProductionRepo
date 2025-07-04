// src/components/BasicForm.js
import React from 'react';

function TextComponent({ text, onChange, label }) {
    return (
      <div className="mb-3">
        <label htmlFor="testAppText" className="form-label">{label}</label>
        <input
          type="text"
          className="form-control"
          id="testAppText"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  export default TextComponent;