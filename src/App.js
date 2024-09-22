import React, { useState } from 'react';
import './App.css';
import HamburgerMenu from './components/HamburgerMenu';
import RowingDataVisualization from './components/RowingDataVisualization';
import UploadDataVisualization from './components/UploadDataVisualization';

function App() {
  const [currentScreen, setCurrentScreen] = useState('built-in');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rowing Data Visualization</h1>
        <HamburgerMenu onSelectScreen={setCurrentScreen} />
      </header>
      <main>
        {currentScreen === 'built-in' ? (
          <RowingDataVisualization />
        ) : (
          <UploadDataVisualization />
        )}
      </main>
    </div>
  );
}

export default App;

