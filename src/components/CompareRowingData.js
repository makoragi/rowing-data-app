import React, { useState, useEffect, useCallback } from 'react';
import { fetchAvailableFiles, fetchCSVData } from '../utils/dataFetching';
import { parseCSV } from '../utils/csvParser';
import FileSelector from './FileSelector';
import GraphSelector from './GraphSelector';
import DataChart from './DataChart';
import SessionInfo from './SessionInfo';

const CompareRowingData = () => {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [selectedFile1, setSelectedFile1] = useState('');
  const [selectedFile2, setSelectedFile2] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');
  const [sessionSummary1, setSessionSummary1] = useState(null);
  const [sessionSummary2, setSessionSummary2] = useState(null);
  const [startTime1, setStartTime1] = useState(null);
  const [startTime2, setStartTime2] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (fileName, setData, setSessionSummary, setStartTime) => {
    setLoading(true);
    setError(null);
    try {
      const csvText = await fetchCSVData(fileName);
      const { parsedData, summary, startTime } = parseCSV(csvText);
      setData(parsedData);
      setSessionSummary(summary);
      setStartTime(startTime);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
      setError(`CSVファイルの読み込みまたは解析に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await fetchAvailableFiles(setAvailableFiles, setError);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (selectedFile1) {
      fetchData(selectedFile1, setData1, setSessionSummary1, setStartTime1);
    }
  }, [selectedFile1, fetchData]);

  useEffect(() => {
    if (selectedFile2) {
      fetchData(selectedFile2, setData2, setSessionSummary2, setStartTime2);
    }
  }, [selectedFile2, fetchData]);

  return (
    <div className="compare-rowing-data-container">
      <h2 className="compare-title">データ比較</h2>
      <div className="file-selectors">
        <FileSelector
          availableFiles={availableFiles}
          onFileSelect={setSelectedFile1}
          selectedFile={selectedFile1}
          label="ファイル1"
        />
        <FileSelector
          availableFiles={availableFiles}
          onFileSelect={setSelectedFile2}
          selectedFile={selectedFile2}
          label="ファイル2"
        />
      </div>
      <GraphSelector
        selectedGraph={selectedGraph}
        onGraphChange={setSelectedGraph}
        isComparisonView={true}
      />

      {error && (
        <div className="error-message">
          <h3>エラー:</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          読み込み中...
        </div>
      ) : (data1.length > 0 || data2.length > 0) ? (
        <>
          <div className="chart-container">
            <DataChart 
              data1={data1.length > 0 ? data1 : null} 
              data2={data2.length > 0 ? data2 : null} 
              selectedGraph={selectedGraph} 
              isComparisonView={true}
            />
          </div>
          <div className="session-info-container">
            {data1.length > 0 && <SessionInfo startTime={startTime1} summary={sessionSummary1} label="セッション1" />}
            {data2.length > 0 && <SessionInfo startTime={startTime2} summary={sessionSummary2} label="セッション2" />}
          </div>
        </>
      ) : (
        <p className="no-data-message">比較するファイルを選択してください。</p>
      )}
    </div>
  );
};

export default CompareRowingData;