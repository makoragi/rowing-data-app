import React, { useState } from 'react';
import './App.css';
import HamburgerMenu from './components/HamburgerMenu';
import RowingDataVisualization from './components/RowingDataVisualization';
import UploadDataVisualization from './components/UploadDataVisualization';
import CompareRowingData from './components/CompareRowingData';

function App() {
  const [currentScreen, setCurrentScreen] = useState('built-in');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'built-in':
        return <RowingDataVisualization />;
      case 'upload':
        return <UploadDataVisualization />;
      case 'compare':
        return <CompareRowingData />;
      default:
        return <RowingDataVisualization />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rowing Data Visualization</h1>
        <HamburgerMenu onSelectScreen={setCurrentScreen} />
      </header>
      <main>
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;