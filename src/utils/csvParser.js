import { parse, format, isValid } from 'date-fns';

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  
  let startTime = null;
  let summary = null;
  let parsedData = [];
  let originalData = [];
  let segments = [];

  // Parse Start Time
  const startTimeIndex = lines.findIndex(line => line.trim().startsWith('Start Time:'));
  if (startTimeIndex !== -1) {
    const startTimeRaw = lines[startTimeIndex].split(',')[1].trim();
    startTime = parseAndFormatDate(startTimeRaw);
  }

  // Parse Session Summary
  const sessionSummaryIndex = lines.findIndex(line => line.trim() === 'Session Summary:');
  if (sessionSummaryIndex !== -1) {
    const headers = lines[sessionSummaryIndex + 2].split(',').map(header => header.trim());
    const units = lines[sessionSummaryIndex + 3].split(',').map(unit => unit.trim());
    const values = lines[sessionSummaryIndex + 4].split(',').map(value => value.trim());
    
    summary = {};
    headers.forEach((header, index) => {
      summary[header] = values[index] || '';
    });
  }

  // Parse Per-Stroke Data
  const dataStartIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:');
  if (dataStartIndex === -1) {
    throw new Error('Could not find "Per-Stroke Data:" in the CSV file');
  }
  const headers = lines[dataStartIndex + 2].split(',').map(header => header.trim());
  const columnIndexes = {
    totalStrokes: headers.indexOf('Total Strokes'),
    distance: headers.indexOf('Distance (GPS)'),
    speed: headers.indexOf('Speed (GPS)'),
    strokeRate: headers.indexOf('Stroke Rate'),
    distancePerStroke: headers.indexOf(`Distance/Stroke (GPS)`),
    elapsedTime: headers.indexOf('Elapsed Time'),
    gpsLat: headers.indexOf('GPS Lat.'),
    gpsLon: headers.indexOf('GPS Lon.')
  };

  originalData = lines.slice(dataStartIndex + 4);
  parsedData = originalData.map(line => {
    const values = line.split(',');
    return {
      stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
      distance: parseFloat(values[columnIndexes.distance]) || 0,
      speed: parseFloat(values[columnIndexes.speed]) || 0,
      strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
      distancePerStroke: parseFloat(values[columnIndexes.distancePerStroke]) || 0,
      elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : '',
      gpsLat: parseFloat(values[columnIndexes.gpsLat]) || null,
      gpsLon: parseFloat(values[columnIndexes.gpsLon]) || null
    };
  }).filter(item => item.gpsLat && item.gpsLon);

  // Split data into segments of 1000m
  let currentSegment = [];
  let currentSegmentDistance = 0;
  let previousDistance = 0; // 初期値として0mから開始

  parsedData.forEach((dataPoint) => {
    const distance = dataPoint.distance; // Distance (GPS)の値
  
    // セグメントにデータポイントを追加
    currentSegment.push(dataPoint);
  
    // 累積距離の増加分を計算
    const distanceIncrement = distance - previousDistance;
    currentSegmentDistance += distanceIncrement;
  
    // 前のデータポイントの累積距離を更新
    previousDistance = distance;
  
    // セグメント距離が1000m以上になったら、新しいセグメントを開始
    if (currentSegmentDistance >= 1000) {
      segments.push(currentSegment);
      currentSegment = [];
      currentSegmentDistance = 0; // 新しいセグメントの距離をリセット
    }
  });
  
  // 最後に残ったデータポイントがある場合、それをセグメントに追加
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return { parsedData, originalData, segments, summary, startTime };
};

const parseAndFormatDate = (dateString) => {
  // console.log('Parsing date string:', dateString); // デバッグログ

  // 日付と時刻を分割
  const [datePart, ...timeParts] = dateString.split(' ');
  const timePart = timeParts.join(' '); // 時刻部分を再結合
  // console.log('Date part:', datePart); // デバッグログ
  // console.log('Time part:', timePart); // デバッグログ


  let parsedDate;
  
  // 様々な日付形式を試行
  const dateFormats = ['MM/dd/yy', 'MM/dd/yyyy', 'yyyy/MM/dd', 'yyyy-MM-dd'];
  for (const format of dateFormats) {
    parsedDate = parse(datePart, format, new Date());
    // console.log(`Trying format: ${format}, Result: ${parsedDate}`); // デバッグログ
    if (isValid(parsedDate)) {
      // console.log('Successful format:', format); // デバッグログ
      break;
    }
  }

  // 有効な日付が見つからない場合
  if (!isValid(parsedDate)) {
    console.error('Failed to parse date:', datePart); // エラーログ
    return null;
  }

  // 時刻部分をパース
  const timeMatch = timePart.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(午前|午後|AM|PM)?/i);
  if (timeMatch) {
    let [, hours, minutes, , period] = timeMatch;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // 午後またはPMの場合、12時間を加算（12時は例外）
    if ((period === '午後' || period?.toUpperCase() === 'PM') && hours !== 12) {
      hours += 12;
    }
    // 午前またはAMの12時は0時として扱う
    if ((period === '午前' || period?.toUpperCase() === 'AM') && hours === 12) {
      hours = 0;
    }

    // 日付と時刻を組み合わせて最終的なDateオブジェクトを作成
    parsedDate.setHours(hours, minutes);
  }

  // フォーマットして返す
  const formattedDate = format(parsedDate, 'yyyy-MM-dd HH:mm');
  // console.log('Formatted date:', formattedDate); // デバッグログ
  return formattedDate;
};

export const parseUploadedCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  
  // Parse Start Time
  const startTimeIndex = lines.findIndex(line => line.trim().startsWith('Start Time:'));
  let startTime = null;
  if (startTimeIndex !== -1) {
    const startTimeRaw = lines[startTimeIndex].split(',')[1].trim();
    startTime = parseAndFormatDate(startTimeRaw);
  }

  // Parse Session Summary
  const sessionSummaryIndex = lines.findIndex(line => line.trim() === 'Session Summary:');
  let summary = null;
  if (sessionSummaryIndex !== -1) {
    const headers = lines[sessionSummaryIndex + 2].split(',').map(header => header.trim());
    const units = lines[sessionSummaryIndex + 3].split(',').map(unit => unit.trim());
    const values = lines[sessionSummaryIndex + 4].split(',').map(value => value.trim());
    
    summary = {};
    headers.forEach((header, index) => {
      summary[header] = values[index] || '';
      if (units[index] && units[index] !== '---') {
        summary[header] += ` ${units[index]}`;
      }
    });
  }

  // Parse Per-Stroke Data
  const dataStartIndex = lines.findIndex(line => line.trim() === 'Per-Stroke Data:');
  if (dataStartIndex === -1) {
    throw new Error('Could not find "Per-Stroke Data:" in the CSV file');
  }
  const headers = lines[dataStartIndex + 2].split(',');
  const columnIndexes = {
    totalStrokes: headers.indexOf('Total Strokes'),
    distance: headers.indexOf('Distance (GPS)'),
    speed: headers.indexOf('Speed (GPS)'),
    strokeRate: headers.indexOf('Stroke Rate'),
    distancePerStroke: headers.indexOf(`Distance/Stroke (GPS)`),
    elapsedTime: headers.indexOf('Elapsed Time')
  };

  const parsedData = lines.slice(dataStartIndex + 4).map(line => {
    const values = line.split(',');
    return {
      stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
      distance: parseFloat(values[columnIndexes.distance]) || 0,
      speed: parseFloat(values[columnIndexes.speed]) || 0,
      strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
      distancePerStroke: parseFloat(values[columnIndexes.distancePerStroke]) || 0,
      elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : ''
    };
  }).filter(item => item.stroke !== 0 && item.distance !== 0 && item.speed !== 0);

  return { parsedData, summary, startTime };
};
