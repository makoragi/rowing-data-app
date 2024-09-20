import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RowingDataVisualization = () => {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');
  const [sessionSummary, setSessionSummary] = useState(null);

  const graphOptions = [
    { value: 'distance-speed', label: 'Distance vs Speed', y1: 'distance', y2: 'speed', unit1: 'm', unit2: 'm/s' },
    { value: 'distance-strokeRate', label: 'Distance vs Stroke Rate', y1: 'distance', y2: 'strokeRate', unit1: 'm', unit2: 'SPM' },
    { value: 'speed-strokeRate', label: 'Speed vs Stroke Rate', y1: 'speed', y2: 'strokeRate', unit1: 'm/s', unit2: 'SPM' },
    { value: 'distance-elapsedTime', label: 'Distance vs Elapsed Time', y1: 'distance', y2: 'elapsedTime', unit1: 'm', unit2: '' },
    { value: 'speed-elapsedTime', label: 'Speed vs Elapsed Time', y1: 'speed', y2: 'elapsedTime', unit1: 'm/s', unit2: '' },
  ];

  useEffect(() => {
    // 利用可能なCSVファイルのリストをここで設定
    // 実際の環境では、このリストをサーバーから動的に取得することもできます
    setAvailableFiles(['20240727_0817.csv', '20240727_1703.csv', '20240728_0803.csv']);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile]);

  const fetchData = async (fileName) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
      const text = await response.text();
      const parsedData = parseCSV(text);
      setData(parsedData);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    
    // Parse Session Summary
    const sessionSummaryIndex = lines.findIndex(line => line.trim() === 'Session Summary:');
    if (sessionSummaryIndex !== -1) {
      const headers = lines[sessionSummaryIndex + 2].split(',').map(header => header.trim());
      const units = lines[sessionSummaryIndex + 3].split(',').map(unit => unit.trim());
      const values = lines[sessionSummaryIndex + 4].split(',').map(value => value.trim());
      
      const summary = {};
      headers.forEach((header, index) => {
        summary[header] = values[index] || '';
        if (units[index] && units[index] !== '---') {
          summary[header] += ` ${units[index]}`;
        }
      });
      setSessionSummary(summary);
    }

    // Parse Per-Stroke Data
    const dataStartIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:');
    if (dataStartIndex === -1) {
      console.error('Could not find "Per-Stroke Data:" in the CSV file');
      return [];
    }
    const headers = lines[dataStartIndex + 2].split(',');
    const columnIndexes = {
      totalStrokes: headers.indexOf('Total Strokes'),
      distance: headers.indexOf('Distance (GPS)'),
      speed: headers.indexOf('Speed (GPS)'),
      strokeRate: headers.indexOf('Stroke Rate'),
      elapsedTime: headers.indexOf('Elapsed Time')
    };

    return lines.slice(dataStartIndex + 4).map(line => {
      const values = line.split(',');
      return {
        stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
        distance: parseFloat(values[columnIndexes.distance]) || 0,
        speed: parseFloat(values[columnIndexes.speed]) || 0,
        strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
        elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : ''
      };
    }).filter(item => item.stroke !== 0 && item.distance !== 0 && item.speed !== 0);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

  const handleGraphChange = (event) => {
    setSelectedGraph(event.target.value);
  };

  const customXAxisTicks = (value) => {
    if (value % 10 === 0) return value;
    if (value % 5 === 0) return '';
    return undefined;
  };

  const getCurrentGraphOption = () => {
    return graphOptions.find(option => option.value === selectedGraph);
  };

  const formatYAxis = (value, dataKey) => {
    if (dataKey === 'elapsedTime') {
      return value;
    }
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const formatTooltip = (value, name, props) => {
    if (name === 'elapsedTime') {
      return value;
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const renderSummaryTable = (summary) => {
    if (!summary) return null;
    
    const rows = [
      { label: 'Total Distance', key: 'Total Distance (GPS)' },
      { label: 'Total Elapsed Time', key: 'Total Elapsed Time' },
      { label: 'Avg Split', key: 'Avg Split (GPS)' },
      { label: 'Avg Speed', key: 'Avg Speed (GPS)' },
      { label: 'Avg Stroke Rate', key: 'Avg Stroke Rate' },
      { label: 'Total Strokes', key: 'Total Strokes' },
      { label: 'Distance/Stroke', key: 'Distance/Stroke (GPS)' }
    ];

    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Session Summary</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {rows.map(row => (
                <th key={row.key} className="bg-gray-200 border border-gray-300 px-3 py-2 text-left">{row.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {rows.map(row => (
                <td key={row.key} className="border border-gray-300 px-3 py-2">{summary[row.key] || '-'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Rowing Data Visualization</h2>
      
      {/* File and Graph Selection */}
      <div className="mb-4">
        <label htmlFor="file-select" className="mr-2">Select CSV file:</label>
        <select 
          id="file-select"
          value={selectedFile} 
          onChange={(e) => setSelectedFile(e.target.value)}
          className="border rounded p-1"
        >
          <option value="">Select a file</option>
          {availableFiles.map(file => (
            <option key={file} value={file}>{file}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="graph-select" className="mr-2">Select Graph:</label>
        <select 
          id="graph-select"
          value={selectedGraph} 
          onChange={(e) => setSelectedGraph(e.target.value)}
          className="border rounded p-1"
        >
          {graphOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="stroke" 
              label={{ value: 'Total Strokes', position: 'insideBottom', offset: -5 }}
              tick={{fontSize: 12}}
              ticks={[...Array(Math.ceil(data[data.length - 1].stroke / 5) + 1)].map((_, i) => i * 5)}
              tickFormatter={customXAxisTicks}
            />
            <YAxis 
              yAxisId="left" 
              label={{ value: `${getCurrentGraphOption().y1} (${getCurrentGraphOption().unit1})`, angle: -90, position: 'insideLeft' }}
              tick={{fontSize: 12}}
              tickFormatter={(value) => formatYAxis(value, getCurrentGraphOption().y1)}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: `${getCurrentGraphOption().y2} (${getCurrentGraphOption().unit2})`, angle: 90, position: 'insideRight' }}
              tick={{fontSize: 12}}
              tickFormatter={(value) => formatYAxis(value, getCurrentGraphOption().y2)}
            />
            <Tooltip formatter={formatTooltip} />
              <Legend />
            <Line yAxisId="left" type="monotone" dataKey={getCurrentGraphOption().y1} stroke="#8884d8" name={getCurrentGraphOption().y1} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey={getCurrentGraphOption().y2} stroke="#82ca9d" name={getCurrentGraphOption().y2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
      ) : (
        <p>Please select a file to visualize data.</p>
      )}

      {/* Session Summary */}
      {renderSummaryTable(sessionSummary)}
    </div>
  );
};

export default RowingDataVisualization;