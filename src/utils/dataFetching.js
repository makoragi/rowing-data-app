import { decode } from 'iconv-lite';
import { getFileKey, getFileName, normalizeFileEntry } from './fileInfo';

export const fetchAvailableFiles = async (jsonPath, setAvailableFiles, setError) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/${jsonPath}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data.files)) {
      const folder = data.folder ?? '';
      const normalizedFiles = data.files.map((file) =>
        normalizeFileEntry(file, folder)
      );
      setAvailableFiles(normalizedFiles);
      return;
    }

    if (Array.isArray(data)) {
      const normalizedFiles = data.map((entry) => normalizeFileEntry(entry));
      setAvailableFiles(normalizedFiles);
      return;
    }

    console.error('Unexpected data structure:', data);
    setError(`Unexpected data structure in ${jsonPath}`);
  } catch (error) {
    console.error('Error fetching available files:', error);
    setError(`Failed to load available files: ${error.message}`);
  }
};

export const fetchCSVData = async (fileInfo) => {
  try {
    const name = getFileName(fileInfo);
    if (!name) {
      throw new Error('CSV file name is not specified');
    }

    const pathKey = getFileKey(fileInfo);
    const response = await fetch(`${process.env.PUBLIC_URL}/data/${pathKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const shiftJisBuffer = new Uint8Array(arrayBuffer);
    const decodedText = decode(shiftJisBuffer, 'Shift_JIS');
    
    return decodedText;
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    throw error;
  }
};