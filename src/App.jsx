import { useState } from 'react';
import './App.css';
import SheetTester from './components/SheetTester';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <h1>Hope3r</h1>
          </div>
          <p className="tagline">Test CRUD operations for Donations, Students, Volunteers & Feedback</p>
        </div>
      </header>

      <main className="app-main">
        <SheetTester />
      </main>

      <footer className="app-footer">
        <p>Built with React + Vite | Google Apps Script Backend</p>
      </footer>
    </div>
  );
}

export default App;
