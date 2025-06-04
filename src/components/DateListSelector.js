import React, { useMemo } from 'react';

const DateListSelector = ({ availableFiles, onFileSelect, selectedFile }) => {
  const sortedFiles = useMemo(() => {
    return [...availableFiles].sort((a, b) => {
      const dateA = new Date(a.split('_')[0]);
      const dateB = new Date(b.split('_')[0]);
      return dateB - dateA;
    });
  }, [availableFiles]);

  const groupedFiles = useMemo(() => {
    const groups = {};
    sortedFiles.forEach(file => {
      const date = file.split('_')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(file);
    });
    return groups;
  }, [sortedFiles]);

  return (
    <div className="date-list-selector">
      {Object.entries(groupedFiles).map(([date, files]) => (
        <div key={date} className="date-group">
          <h3>{new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          <ul>
            {files.map(file => (
              <li key={file}>
                <button 
                  onClick={() => onFileSelect(file)}
                  className={selectedFile === file ? 'selected' : ''}
                >
                  {file.split('_')[1].replace('.csv', '')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DateListSelector;