import React from 'react';
import './App.css';
import RowingDataVisualization from './components/RowingDataVisualization';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Rowing Data Visualization</h1>
      </header>
      <main>
        <RowingDataVisualization />
      </main>
    </div>
  );
}

export default App;