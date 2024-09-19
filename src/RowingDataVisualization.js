import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RowingDataVisualization = () => {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);

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
    const dataStartIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:') + 2;
    const headers = lines[dataStartIndex].split(',');
    const intervalIndex = headers.indexOf('Interval');
    const distanceIndex = headers.indexOf('Distance (GPS)');
    const timeIndex = headers.indexOf('Elapsed Time');
    const speedIndex = headers.indexOf('Speed (GPS)');

    return lines.slice(dataStartIndex + 1).map(line => {
      const values = line.split(',');
      return {
        stroke: parseInt(values[intervalIndex]),
        distance: parseFloat(values[distanceIndex]),
        elapsedTime: values[timeIndex],
        speed: parseFloat(values[speedIndex])
      };
    }).filter(item => !isNaN(item.stroke) && !isNaN(item.distance) && !isNaN(item.speed));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

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
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="stroke" 
              label={{ value: 'Stroke', position: 'insideBottom', offset: -5 }}
              tick={{fontSize: 12}}
            />
            <YAxis 
              yAxisId="left" 
              label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft' }}
              tick={{fontSize: 12}}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: 'Speed (m/s)', angle: 90, position: 'insideRight' }}
              tick={{fontSize: 12}}
            />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="distance" stroke="#8884d8" name="Distance" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#82ca9d" name="Speed" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Please select a file to visualize data.</p>
      )}
    </div>
  );
};

export default RowingDataVisualization;