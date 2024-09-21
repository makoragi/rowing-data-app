// src/utils/csvParser.js
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  
  // Parse Session Summary
  const sessionSummaryIndex = lines.findIndex(line => line.trim() === 'Session Summary:');
  let summary = null;
  if (sessionSummaryIndex !== -1) {
    const headers = lines[sessionSummaryIndex + 2].split(',').map(header => header.trim());
    const units = lines[sessionSummaryIndex + 3].split(',').map(unit => unit.trim());
    const values = lines[sessionSummaryIndex + 4].split(',').map(value => value.trim());
    
    summary = {};
    headers.forEach((header, index) => {
      summary[header] = values[index] || '';
      if (units[index] && units[index] !== '---') {
        summary[header] += ` ${units[index]}`;
      }
    });
  }

  // Parse Per-Stroke Data
  const dataStartIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:');
  if (dataStartIndex === -1) {
    throw new Error('Could not find "Per-Stroke Data:" in the CSV file');
  }
  const headers = lines[dataStartIndex + 2].split(',');
  const columnIndexes = {
    totalStrokes: headers.indexOf('Total Strokes'),
    distance: headers.indexOf('Distance (GPS)'),
    speed: headers.indexOf('Speed (GPS)'),
    strokeRate: headers.indexOf('Stroke Rate'),
    elapsedTime: headers.indexOf('Elapsed Time')
  };

  const parsedData = lines.slice(dataStartIndex + 4).map(line => {
    const values = line.split(',');
    return {
      stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
      distance: parseFloat(values[columnIndexes.distance]) || 0,
      speed: parseFloat(values[columnIndexes.speed]) || 0,
      strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
      elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : ''
    };
  }).filter(item => item.stroke !== 0 && item.distance !== 0 && item.speed !== 0);

  return { parsedData, summary };
};
