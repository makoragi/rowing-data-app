// src/components/SessionSummary.js
import React from 'react';

const SessionSummary = ({ summary }) => {
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
      <table className="w-full border-collapse border-2 border-gray-500">
        <thead>
          <tr>
            {rows.map(row => (
              <th key={row.key} className="bg-gray-200 border-2 border-gray-500 px-4 py-2 text-left">{row.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {rows.map(row => (
              <td key={row.key} className="border-2 border-gray-500 px-4 py-2">{summary[row.key] || '-'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SessionSummary;
