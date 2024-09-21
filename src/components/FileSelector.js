// src/components/FileSelector.js
import React from 'react';

const FileSelector = ({ selectedFile, availableFiles, onFileChange }) => (
  <div className="mb-4 flex items-center">
    <label htmlFor="file-select" className="mr-2">Select CSV file:</label>
    <select 
      id="file-select"
      value={selectedFile} 
      onChange={(e) => onFileChange(e.target.value)}
      className="border rounded p-1 flex-grow"
    >
      <option value="">Select a file</option>
      {availableFiles.map(file => (
        <option key={file} value={file}>{file}</option>
      ))}
    </select>
  </div>
);

export default FileSelector;
