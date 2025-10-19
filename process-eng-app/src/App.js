// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';


import HomePage from './pages/HomePage';

function App() {

  const [selectedVertMenu, setSelectedVertMenu] = useState(() => {
    return localStorage.getItem("selectedMenu") || "item-types-page";
  });
  
  
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


