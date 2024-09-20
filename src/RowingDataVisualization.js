import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RowingDataVisualization = () => {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');

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
      console.log('Parsed Data:', parsedData);
      setData(parsedData);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  };
  
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
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
    console.log('Column Indexes:', columnIndexes);

    return lines.slice(dataStartIndex + 3).map((line, index) => {
      const values = line.split(',');
      const parsedValues = {
        stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
        distance: parseFloat(values[columnIndexes.distance]) || 0,
        speed: parseFloat(values[columnIndexes.speed]) || 0,
        strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
        elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : ''
      };
      
      if (index < 5) console.log('Parsed Values:', parsedValues);

      return parsedValues;
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

  console.log('Current Graph Option:', getCurrentGraphOption());
  console.log('Data Length:', data.length);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Rowing Data Visualization</h2>
      <div className="mb-4">
        <label htmlFor="file-select" className="mr-2">Select CSV file:</label>
        <select 
          id="file-select"
          value={selectedFile} 
          onChange={handleFileChange}
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
          onChange={handleGraphChange}
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
    </div>
  );
};

export default RowingDataVisualization;