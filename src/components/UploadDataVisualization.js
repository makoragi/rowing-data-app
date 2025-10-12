import React, { useState, useCallback } from 'react';
import { parseUploadedCSV } from '../utils/csvParser';
import FileUploader from './FileUploader';
import GraphSelector from './GraphSelector';
import DataChart from './DataChart';
import SessionInfo from './SessionInfo';
import MapView from './MapView';

const UploadDataVisualization = () => {
  const [data, setData] = useState([]);
  const [segments, setSegments] = useState([]);
  const [highlightRange, setHighlightRange] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');
  const [sessionSummary, setSessionSummary] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const handleFileUpload = useCallback((content, fileName) => {
    try {
      const { parsedData, summary, startTime, segments } = parseUploadedCSV(content);
      setData(parsedData);
      setSessionSummary(summary);
      setStartTime(startTime);
      setUploadedFileName(fileName);
      setSegments(segments || []);
      setHighlightRange(null);
      setError(null);
    } catch (error) {
      console.error('Error parsing uploaded CSV:', error);
      setError('Failed to parse the uploaded CSV file. Please check the file format.');
    }
  }, []);

  const handleRangeSelect = useCallback((range) => {
    setHighlightRange(range);
  }, []);

  return (
    <div className="upload-data-visualization">
      <h2>データアップロード</h2>
      <FileUploader onFileUpload={handleFileUpload} />
      {uploadedFileName && (
        <div className="uploaded-file-info">
          アップロードされたファイル: {uploadedFileName}
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {data.length > 0 && (
        <>
          <GraphSelector
            selectedGraph={selectedGraph}
            onGraphChange={setSelectedGraph}
          />
          <div className="chart-map-wrapper">
            <div className="chart-container">
              <DataChart
                data={data}
                selectedGraph={selectedGraph}
                onRangeSelect={handleRangeSelect}
              />
            </div>
            <div className="map-container">
              <MapView segments={segments} data={data} highlightRange={highlightRange} />
            </div>
          </div>
          <SessionInfo startTime={startTime} summary={sessionSummary} />
        </>
      )}
    </div>
  );
};

export default UploadDataVisualization;
