import React from "react";

const FileSelector = ({ availableFiles, onFileSelect, selectedFile }) => {
  const currentIndex = availableFiles.indexOf(selectedFile);

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
        value={selectedFile}
        onChange={(e) => onFileSelect(e.target.value)}
        className="file-select"
      >
        <option value="">ファイルを選択してください</option>
        {availableFiles.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
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
