import React, { useState } from 'react';
import './App.css';
import HamburgerMenu from './components/HamburgerMenu';
import RowingDataVisualization from './components/RowingDataVisualization';
import UploadDataVisualization from './components/UploadDataVisualization';
import CSVSegmentProcessor from './components/CSVSegmentProcessor';
import LandingPage from './components/LandingPage';

const WAKANA_CONFIG = {
  title: 'WAKANA SC',
  filesSource: 'available_files_wakana.json',
};

const SUZUKA_CONFIG = {
  title: 'SUZUKA SC',
  filesSource: 'available_files_suzuka.json',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [dataConfig, setDataConfig] = useState(WAKANA_CONFIG);

  const showLanding = () => {
    setCurrentScreen('home');
  };

  const showWakana = () => {
    setDataConfig(WAKANA_CONFIG);
    setCurrentScreen('rowing');
  };

  const showSuzuka = () => {
    setDataConfig(SUZUKA_CONFIG);
    setCurrentScreen('rowing');
  };

  const handleSelectScreen = (screen) => {
    switch (screen) {
      case 'home':
        showLanding();
        break;
      case 'wakana':
        showWakana();
        break;
      case 'suzuka':
        showSuzuka();
        break;
      case 'upload':
      case 'processing':
        setCurrentScreen(screen);
        break;
      default:
        setCurrentScreen(screen);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rowing Data Visualization</h1>
        <HamburgerMenu onSelectScreen={handleSelectScreen} />
      </header>
      <main>
        {currentScreen === 'home' && (
          <LandingPage onSelectWakana={showWakana} onSelectSuzuka={showSuzuka} />
        )}
        {currentScreen === 'rowing' && (
          <RowingDataVisualization dataConfig={dataConfig} />
        )}
        {currentScreen === 'upload' && <UploadDataVisualization />}
        {currentScreen === 'processing' && <CSVSegmentProcessor />}
      </main>
    </div>
  );
}

export default App;

