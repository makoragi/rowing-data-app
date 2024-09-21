// src/components/RowingDataVisualization.js
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAvailableFiles, fetchCSVData } from '../utils/dataFetching';
import { parseCSV } from '../utils/csvParser';
import FileSelector from './FileSelector';
import GraphSelector from './GraphSelector';
import DataChart from './DataChart';
import SessionSummary from './SessionSummary';

const RowingDataVisualization = () => {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');
  const [sessionSummary, setSessionSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableFiles(setAvailableFiles, setError);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile]);

  const fetchData = useCallback(async (fileName) => {
    setLoading(true);
    setError(null);
    try {
      const csvText = await fetchCSVData(fileName);
      const { parsedData, summary } = parseCSV(csvText);
      setData(parsedData);
      setSessionSummary(summary);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
      setError('Failed to load or parse the CSV file. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="rowing-data-container">
      <div className="selector-container">
        <FileSelector
          selectedFile={selectedFile}
          availableFiles={availableFiles}
          onFileChange={setSelectedFile}
        />
        <GraphSelector
          selectedGraph={selectedGraph}
          onGraphChange={setSelectedGraph}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          Loading...
        </div>
      ) : data.length > 0 ? (
        <div className="chart-container">
          <DataChart data={data} selectedGraph={selectedGraph} />
        </div>
      ) : (
        <p className="no-data-message">Please select a file to visualize data.</p>
      )}

      <div className="session-summary">
        <SessionSummary summary={sessionSummary} />
      </div>
    </div>
  );
};

export default RowingDataVisualization;
