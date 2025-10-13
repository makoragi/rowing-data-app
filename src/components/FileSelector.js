import React from 'react';
import { getFileDisplayName, getFileKey } from '../utils/fileInfo';

const FileSelector = ({ availableFiles, onFileSelect, selectedFile }) => {
  const selectedKey = getFileKey(selectedFile);
  const currentIndex = availableFiles.findIndex(
    (file) => getFileKey(file) === selectedKey
  );

  const handlePrev = () => {
    if (currentIndex > 0) {
      onFileSelect(availableFiles[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < availableFiles.length - 1) {
      onFileSelect(availableFiles[currentIndex + 1]);
    }
  };

  return (
    <div className="file-selector">
      <button
        className="file-nav-btn"
        onClick={handlePrev}
        disabled={currentIndex <= 0}
      >
        &lt;
      </button>
      <select
        value={selectedKey}
        onChange={(e) => {
          const file = availableFiles.find(
            (item) => getFileKey(item) === e.target.value
          );
          onFileSelect(file || null);
        }}
        className="file-select"
      >
        <option value="">ファイルを選択してください</option>
        {availableFiles.map((file) => {
          const key = getFileKey(file);
          return (
            <option key={key} value={key}>
              {getFileDisplayName(file)}
            </option>
          );
        })}
      </select>
      <button
        className="file-nav-btn"
        onClick={handleNext}
        disabled={
          currentIndex === -1 || currentIndex >= availableFiles.length - 1
        }
      >
        &gt;
      </button>
    </div>
  );
};

export default FileSelector;
