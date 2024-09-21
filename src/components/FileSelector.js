import React from 'react';

const FileSelector = ({ availableFiles, onFileSelect, selectedFile }) => {
  return (
    <div className="file-selector">
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
    </div>
  );
};

export default FileSelector;