import React, { useState } from 'react';
import './App.css';
import HamburgerMenu from './components/HamburgerMenu';
import RowingDataVisualization from './components/RowingDataVisualization';
import UploadDataVisualization from './components/UploadDataVisualization';
import CSVSegmentProcessor from './components/CSVSegmentProcessor';

function App() {
  const [currentScreen, setCurrentScreen] = useState('built-in');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rowing Data Visualization</h1>
        <HamburgerMenu onSelectScreen={setCurrentScreen} />
      </header>
      <main>
        {currentScreen === 'upload' ? (
          <UploadDataVisualization />
        ) : currentScreen === 'processing' ? (
          <CSVSegmentProcessor />
        ) : (
          <RowingDataVisualization />
        )}
      </main>
    </div>
  );
}

export default App;

