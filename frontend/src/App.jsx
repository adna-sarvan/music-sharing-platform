import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Istraži</Link>
          <Link to="/upload" style={{ color: '#bc13fe', textDecoration: 'none', fontWeight: 'bold' }}>+ Dodaj</Link>
        </nav>

        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;