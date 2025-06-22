// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ItemTypesPage from './pages/ItemTypesPage';
import TestApplicationsPage from './pages/TestApplicationsPage';
import ItemTypePage from './pages/ItemTypePage';

function Navbar() {
  return (
    <nav className="navbar navbar-expand navbar-light bg-light px-3">
      <Link className="nav-link" to="/item-types">Item Types</Link>
      <Link className="nav-link" to="/test-applications">Test Applications</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/item-types" element={<ItemTypesPage />} />
        <Route path="/test-applications" element={<TestApplicationsPage />} />
        <Route path="/item-types/:action" element={<ItemTypePage />} />
        <Route path="*" element={<ItemTypesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
