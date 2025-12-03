// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import constants from './constants';

import HomePage from './pages/HomePage';

function App() {

  const [selectedVertMenu, setSelectedVertMenu] = useState(() => {
    return localStorage.getItem("selectedMenu") || "item-types-page";
  });
  
  const processEngAppVersion = process.env.REACT_APP_CALIBRIX_WEB_FRONTEND_VERSION || "0.0.0";
  const [serverVersion, setServerVersion] = useState(null);

  // Version check on startup
  useEffect(() => {
    fetch(`${constants.API_BASE}/version`, {method: "GET"})
      .then(res => res.json())
      .then(data => {
        setServerVersion(data.serverVersion);

        if (data.serverVersion !== processEngAppVersion) {
          alert(
            `❗ Version mismatch!\n` +
            `Process Engineer App: ${processEngAppVersion}\n` +
            `Server: ${data.serverVersion}\n\n` +
            `Please let Julia know.`
          );
          console.error("VERSION MISMATCH:", processEngAppVersion, data.serverVersion);
        } else {
          console.log("Version OK:", processEngAppVersion);
        }
      })
      .catch(err => {
        console.error("Version check failed:", err);
        alert("Cannot reach backend /api/version");
      });
  }, [processEngAppVersion]);

  // Load from localStorage on first render
  //localStorage is a Web API provided by the browser
  //It lets you store simple key–value pairs that persist even after reload or closing the tab.
  //The data stays on the user’s computer until it’s explicitly cleared.
  useEffect(() => {
    const saved = localStorage.getItem("selectedMenu");
        if (saved) {
      setSelectedVertMenu(saved);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => { 
    console.log(`Selected menu changed to ${selectedVertMenu}`);
    localStorage.setItem("selectedMenu", selectedVertMenu); 
  }, [selectedVertMenu]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage
                                            selectedMenu={selectedVertMenu}
                                            setSelectedMenu={setSelectedVertMenu}
                                             />} />
      </Routes>
    </Router>
  );
}

export default App;


