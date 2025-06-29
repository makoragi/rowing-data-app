import React, { useState } from 'react';
import { parseCSV } from '../utils/csvParser'; // 既存のCSVパーサーをインポート

const CSVSegmentProcessor = () => {
  const [parsedResult, setParsedResult] = useState(null);
  const [originalLines, setOriginalLines] = useState([]);
  const [startStroke, setStartStroke] = useState(0);
  const [endStroke, setEndStroke] = useState(null);
  const [processedContent, setProcessedContent] = useState('');

  // ファイルアップロード後、内容を読み込みパースする
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split('\n');
      setOriginalLines(lines);
      try {
        const result = parseCSV(content); // { parsedData, originalData, segments, summary, startTime } を返す
        setParsedResult(result);
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
  };

  // 選択したStrokes範囲で新たなCSVファイルを再構築する処理
  const handleProcess = () => {
    if (!parsedResult || originalLines.length === 0) return;
    const { summary, originalData } = parsedResult;
    const startIndex = startStroke; // 入力は 0...
    let endIndex;
    if (endStroke === null) {
      alert("終了Strokesを入力してください。");
      return;
    } else if (endStroke === 0) {
      endIndex = originalData.length - 1;
    } else {
      endIndex = endStroke - 1; // 入力は 1...
    }
    if (startIndex < 0 || endIndex < -1 || startIndex > endIndex || endIndex >= originalData.length) {
      alert("無効なStrokes範囲です。");
      return;
    }
    
    const lines = originalLines;
    // 各セクションの行位置を特定
    const sessionInfoIndex = lines.findIndex(line => line.trim().includes('Session Information'));
    const sessionSummaryIndex = lines.findIndex(line => line.trim() === 'Session Summary:');
    const intervalSummariesIndex = lines.findIndex(line => line.trim() === 'Interval Summaries:');
    const perStrokeIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:');
    if (sessionInfoIndex === -1 || sessionSummaryIndex === -1 || intervalSummariesIndex === -1 || perStrokeIndex === -1) {
      alert("CSVフォーマットエラー：必要なセクションが見つかりません。");
      return;
    }
    
    // ① セッション情報部：ファイル冒頭～"Session Summary:"行まで
    const sessionInfoPart = lines.slice(0, sessionSummaryIndex);

    // ② インターバルサマリ部："Interval Summaries:"行～"Per-Stroke Data:"行まで
    const intervalSummariesPart = lines.slice(intervalSummariesIndex, perStrokeIndex);

    // ③ Per‑Stroke Data セクションのテーブルヘッダー部分
    const perStrokeAuxiliary = lines[perStrokeIndex];
    const dataHeaderLine = lines[perStrokeIndex + 2] || "";
    const dataUnitsLine  = lines[perStrokeIndex + 3] || "";

    // ④ 新たなデータ行：指定したStrokes範囲の行をそのまま抽出
    const newDataRows = originalData.slice(startIndex, endIndex + 1);
    
    // ⑤ Session Summary セクションの再構築
    // 以下は固定フォーマットとし、元のサマリ値行以降は出力しない
    const sessionSummaryLine = "Session Summary:"; // 固定の見出し
    const summaryHeaderLine = lines[sessionSummaryIndex + 2] || "";
    const summaryUnitsLine  = lines[sessionSummaryIndex + 3] || "";
    
    // サマリ値行を新たに生成（例：指定範囲の最後のデータをもとに更新）
    const newSummary = { ...summary };
    const lastData = parsedResult.parsedData[endIndex] || parsedResult.parsedData[parsedResult.parsedData.length - 1];
    const firstData = parsedResult.parsedData[startIndex] || parsedResult.parsedData[0];
    if (newSummary["Total Strokes"] !== undefined) {
      newSummary["Total Strokes"] = endIndex - startIndex + 1;
    }
    if (newSummary["Total Distance (GPS)"] !== undefined) {
      newSummary["Total Distance (GPS)"] = (lastData.distance - firstData.distance + firstData.distancePerStroke).toFixed(1);
    }
    if (newSummary["Total Elapsed Time"] !== undefined) {
      if (startIndex === 0) {
        newSummary["Total Elapsed Time"] = lastData.elapsedTime;
      } else {
        const previousData = parsedResult.parsedData[startIndex - 1] || { elapsedTime: '00:00:00' };
        const startTime = new Date(`1970-01-01T${previousData.elapsedTime}Z`);
        const endTime = new Date(`1970-01-01T${lastData.elapsedTime}Z`);
        console.log(startTime, endTime);
        const elapsedTimeMs = endTime - startTime;
        const elapsedTimeSec = Math.floor(elapsedTimeMs / 1000);
        const hours = Math.floor(elapsedTimeSec / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedTimeSec % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsedTimeSec % 60).toString().padStart(2, '0');
        newSummary["Total Elapsed Time"] = `${hours}:${minutes}:${seconds}`;
      }
    }
    if (newSummary["Avg Split (GPS)"] !== undefined) {
      newSummary["Avg Split (GPS)"] = '---'; // 未対応
    }
    if (newSummary["Avg Speed (GPS)"] !== undefined) {
      const totalDistance = newSummary["Total Distance (GPS)"];
      const totalTime = newSummary["Total Elapsed Time"];
      if (totalDistance !== undefined && totalTime !== undefined) {
        const timeParts = totalTime.split(':').map(Number);
        const totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        if (totalSeconds > 0) {
          newSummary["Avg Speed (GPS)"] = (totalDistance / totalSeconds).toFixed(2);
        } else {
          newSummary["Avg Speed (GPS)"] = '---';
        }
      } else {
        newSummary["Avg Speed (GPS)"] = '---';
      }
    }
    if (newSummary['Avg Stroke Rate'] !== undefined) {
      newSummary['Avg Stroke Rate'] = '---'; // 未対応
    }
    if (newSummary['Distance/Stroke (GPS)'] !== undefined) {
      newSummary['Distance/Stroke (GPS)'] = (newSummary["Total Distance (GPS)"] / newSummary["Total Strokes"]).toFixed(1);
    }
    if (newSummary["Start GPS Lat."] !== undefined) {
      newSummary["Start GPS Lat."] = firstData.gpsLat || '';
    }
    if (newSummary["Start GPS Lon."] !== undefined) {
      newSummary["Start GPS Lon."] = firstData.gpsLon || '';
    }
    const summaryHeaders = summaryHeaderLine.split(',').map(h => h.trim());
    const newSummaryValuesLine = summaryHeaders.map(header => newSummary[header] || '').join(',');

    // ⑥ 新しいCSV全体の再構築（元の空行を保持）
    const newLines = [
      // セッション情報部
      ...sessionInfoPart,
      // 新しいSession Summary セクション
      sessionSummaryLine,
      "", // 区切り用の空行（任意）
      summaryHeaderLine,
      summaryUnitsLine,
      newSummaryValuesLine,
      "", // 区切り用の空行（任意）
      "", // 区切り用の空行（任意）
      // インターバルサマリ部
      ...intervalSummariesPart,
      // Per‑Stroke Data セクションのテーブルヘッダー部分
      perStrokeAuxiliary,
      "", // 区切り用の空行（任意）
      dataHeaderLine,
      dataUnitsLine,
      // 加工済みの新たなデータ行
      ...newDataRows,
      "" // 区切り用の空行（任意）
    ];
    
    setProcessedContent(newLines.join('\n'));
  };

  // 加工済みCSVをダウンロードする
  const downloadFile = () => {
    if (!processedContent) return;
    const blob = new Blob([processedContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_file.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>CSV セグメント加工コンポーネント</h2>
      <div>
        <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />
      </div>
      {parsedResult && (
        <div style={{ marginTop: '10px' }}>
          <label>開始Strokes: </label>
          <input
            type="number"
            value={startStroke}
            onChange={e => setStartStroke(parseInt(e.target.value))}
          />
          <label>終了Strokes: </label>
          <input
            type="number"
            value={endStroke !== null ? endStroke : ''}
            onChange={e => setEndStroke(e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleProcess}>CSV を加工する</button>
      </div>
      {processedContent && (
        <div style={{ marginTop: '20px' }}>
          <h3>加工済み CSV プレビュー</h3>
          <textarea
            style={{ width: '100%', height: '200px' }}
            value={processedContent}
            readOnly
          ></textarea>
          <div style={{ marginTop: '10px' }}>
            <button onClick={downloadFile}>ダウンロード</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVSegmentProcessor;
