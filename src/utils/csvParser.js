import { parse, format, isValid } from 'date-fns';

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  
  let startTime = null;
  let summary = null;
  let parsedData = [];

  // Parse Start Time
  const startTimeIndex = lines.findIndex(line => line.trim().startsWith('Start Time:'));
  if (startTimeIndex !== -1) {
    const startTimeRaw = lines[startTimeIndex].split(',')[1].trim();
    console.log('Raw start time:', startTimeRaw); // デバッグログ
    startTime = parseAndFormatDate(startTimeRaw);
    console.log('Parsed start time:', startTime); // デバッグログ
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
    elapsedTime: headers.indexOf('Elapsed Time')
  };

  parsedData = lines.slice(dataStartIndex + 4).map(line => {
    const values = line.split(',');
    return {
      stroke: parseInt(values[columnIndexes.totalStrokes]) || 0,
      distance: parseFloat(values[columnIndexes.distance]) || 0,
      speed: parseFloat(values[columnIndexes.speed]) || 0,
      strokeRate: parseFloat(values[columnIndexes.strokeRate]) || 0,
      elapsedTime: values[columnIndexes.elapsedTime] ? values[columnIndexes.elapsedTime].trim() : ''
    };
  }).filter(item => item.stroke !== 0 && item.distance !== 0 && item.speed !== 0);

  return { parsedData, summary, startTime };
};

const parseAndFormatDate = (dateString) => {
  console.log('Parsing date string:', dateString); // デバッグログ

  // 日付と時刻を分割
  const [datePart, ...timeParts] = dateString.split(' ');
  const timePart = timeParts.join(' '); // 時刻部分を再結合

  console.log('Date part:', datePart); // デバッグログ
  console.log('Time part:', timePart); // デバッグログ

  let parsedDate;
  
  // 様々な日付形式を試行
  const dateFormats = ['MM/dd/yyyy', 'MM/dd/yy', 'yyyy/MM/dd', 'yyyy-MM-dd'];
  for (const format of dateFormats) {
    parsedDate = parse(datePart, format, new Date());
    if (isValid(parsedDate)) {
      console.log('Successful format:', format); // デバッグログ
      break;
    }
  }

  // 有効な日付が見つからない場合
  if (!isValid(parsedDate)) {
    console.error('Invalid date format:', datePart);
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
  console.log('Formatted date:', formattedDate); // デバッグログ
  return formattedDate;
};