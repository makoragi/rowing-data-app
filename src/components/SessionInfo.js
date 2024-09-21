import React from 'react';
import { format, parseISO } from 'date-fns';

const SessionInfo = ({ startTime, summary }) => {
  if (!startTime && !summary) return null;

  const formatDate = (dateString) => {
    try {
      // dateStringがすでに正しいフォーマット（"yyyy-MM-dd HH:mm"）である前提
      const date = parseISO(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '日付不明';
    }
  };

  const formattedDate = startTime ? formatDate(startTime) : '日付不明';

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