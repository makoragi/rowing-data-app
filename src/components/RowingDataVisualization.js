import React, { useState, useEffect, useCallback } from 'react';
import { fetchAvailableFiles, fetchCSVData } from '../utils/dataFetching';
import { parseCSV } from '../utils/csvParser';
import CalendarSelector from './CalendarSelector';
import FileSelector from './FileSelector';
import GraphSelector from './GraphSelector';
import DataChart from './DataChart';
import SessionInfo from './SessionInfo';
import MapView from './MapView';

const RowingDataVisualization = () => {
  const [data, setData] = useState([]);
  const [segments, setSegments] = useState([]);
  const [highlightRange, setHighlightRange] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('distance-speed');
  const [sessionSummary, setSessionSummary] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useCalendar, setUseCalendar] = useState(false);

  const fetchData = useCallback(async (fileName) => {
    setLoading(true);
    setError(null);
    try {
      const csvText = await fetchCSVData(fileName);
      const { parsedData, segments, summary, startTime } = parseCSV(csvText);
      // console.log('Parsed segments:', segments); // デバッグログ
      setData(parsedData);
      setSegments(segments);
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
    if (availableFiles.length > 0 && !selectedFile) {
      const latestFile = availableFiles[availableFiles.length - 1];
      setSelectedFile(latestFile);
    }
  }, [availableFiles, selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile, fetchData]);

  const toggleSelector = () => {
    setUseCalendar(!useCalendar);
  };

  const handleRangeSelect = (range) => {
    setHighlightRange(range);
  };

  return (
    <div className="rowing-data-container">
      <h2 className="wakana-sc-title">WAKANA SC</h2>
      <div className="selector-toggle">
        <button onClick={toggleSelector}>
          {useCalendar ? 'リスト表示に切り替え' : 'カレンダー表示に切り替え'}
        </button>
      </div>
      <div className="selector-container">
        {useCalendar ? (
          <CalendarSelector
            availableFiles={availableFiles}
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        ) : (
          <FileSelector
            availableFiles={availableFiles}
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        )}
        <GraphSelector
          selectedGraph={selectedGraph}
          onGraphChange={setSelectedGraph}
        />
      </div>

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
      ) : data.length > 0 ? (
        <>
          <div className="chart-container">
            <DataChart data={data} selectedGraph={selectedGraph} onRangeSelect={handleRangeSelect} />
          </div>
          <SessionInfo startTime={startTime} summary={sessionSummary} />
          <div className="map-container">
            <MapView segments={segments} data={data} highlightRange={highlightRange} />
          </div>
        </>
      ) : (
        <p className="no-data-message">表示するデータがありません。ファイルを選択してください。</p>
      )}
    </div>
  );
};

export default RowingDataVisualization;