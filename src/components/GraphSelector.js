// src/components/GraphSelector.js
import React from 'react';
import { graphOptions } from '../utils/constants';

const GraphSelector = ({ selectedGraph, onGraphChange }) => (
  <div className="mb-4 flex items-center">
    <label htmlFor="graph-select" className="mr-2">Select Graph:</label>
    <select 
      id="graph-select"
      value={selectedGraph} 
      onChange={(e) => onGraphChange(e.target.value)}
      className="border rounded p-1 flex-grow"
    >
      {graphOptions.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export default GraphSelector;
