import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Istraži</Link>
          <Link to="/upload" style={{ color: '#bc13fe', textDecoration: 'none', fontWeight: 'bold' }}>+ Dodaj</Link>
          <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
          <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Kontakt</Link>
        </nav>

        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
