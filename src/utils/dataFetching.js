import { decode } from 'iconv-lite';

export const fetchAvailableFiles = async (setAvailableFiles, setError) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/available_files.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data.files)) {
      setAvailableFiles(data.files);
    } else {
      console.error('Unexpected data structure:', data);
      setError('Unexpected data structure in available_files.json');
    }
  } catch (error) {
    console.error('Error fetching available files:', error);
    setError(`Failed to load available files: ${error.message}`);
  }
};

export const fetchCSVData = async (fileName) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/${fileName}`);
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