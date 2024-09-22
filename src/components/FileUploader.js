import React, { useRef } from 'react';

const FileUploader = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileUpload(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()}>
        CSVファイルをアップロード
      </button>
    </div>
  );
};

export default FileUploader;