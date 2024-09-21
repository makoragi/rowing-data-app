import React from 'react';

const SessionInfo = ({ startTime, summary }) => {
  if (!startTime && !summary) return null;

  const parseDate = (dateString) => {
    // 日本語の曜日を削除（存在する場合）
    const cleanDateString = dateString.replace(/\([月火水木金土日]\)/, '').trim();
    
    // 日付と時刻を分割
    const [datePart, timePart] = cleanDateString.split(' ');
    
    // 日付をパース（MM/DD/YYYY形式を想定）
    const [month, day, year] = datePart.split('/');
    
    // 時刻をパース
    let [hours, minutes, period] = timePart.split(/[: ]/);
    hours = parseInt(hours);
    
    // 午後の場合、12時間を加算（12時は例外）
    if (period === '午後' && hours !== 12) {
      hours += 12;
    }
    // 午前の12時は0時として扱う
    if (period === '午前' && hours === 12) {
      hours = 0;
    }
    
    // Dateオブジェクトを作成（月は0から始まるため、-1する）
    const date = new Date(year, month - 1, day, hours, minutes);
    
    // 有効な日付かチェック
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '日付不明';
    }
    
    // 日付を指定のフォーマットに変換
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formattedDate = startTime ? parseDate(startTime) : '日付不明';

  return (
    <div className="session-info">
      <h3>セッション情報</h3>
      <p>開始時間: {formattedDate}</p>
      {summary && (
        <>
          <p>総距離: {summary['Total Distance (GPS)']}</p>
          <p>総時間: {summary['Total Elapsed Time']}</p>
          <p>平均速度: {summary['Avg Speed (GPS)']}</p>
        </>
      )}
    </div>
  );
};

export default SessionInfo;