import React, { useState, useMemo, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO } from 'date-fns';

const CalendarSelector = ({ availableFiles, onFileSelect, selectedFile }) => {
  const filesByDate = useMemo(() => {
    const filesMap = {};
    availableFiles.forEach(file => {
      const date = file.split('_')[0];
      if (!filesMap[date]) filesMap[date] = [];
      filesMap[date].push(file);
    });
    return filesMap;
  }, [availableFiles]);

  const latestDateWithData = useMemo(() => {
    const dates = Object.keys(filesByDate).sort((a, b) => b.localeCompare(a));
    return dates.length > 0 ? parseISO(dates[0]) : new Date();
  }, [filesByDate]);

  const [selectedDate, setSelectedDate] = useState(latestDateWithData);

  useEffect(() => {
    setSelectedDate(latestDateWithData);
  }, [latestDateWithData]);

  useEffect(() => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const filesForDate = filesByDate[dateString] || [];
    if (filesForDate.length > 0 && (!selectedFile || !filesForDate.includes(selectedFile))) {
      onFileSelect(filesForDate[0]);
    }
  }, [selectedDate, filesByDate, selectedFile, onFileSelect]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(date, 'yyyy-MM-dd');
      return filesByDate[dateString] ? 'has-data' : null;
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(date, 'yyyy-MM-dd');
      const filesForDate = filesByDate[dateString] || [];
      return filesForDate.length > 0 ? (
        <div className="file-count">{filesForDate.length}</div>
      ) : null;
    }
  };

  const filesForSelectedDate = filesByDate[format(selectedDate, 'yyyy-MM-dd')] || [];

  return (
    <div className="calendar-selector">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="custom-calendar"
      />
      <div className="files-list">
        <h3>{format(selectedDate, 'yyyy年MM月dd日')}</h3>
        {filesForSelectedDate.length > 0 ? (
          <ul>
            {filesForSelectedDate.map(file => (
              <li key={file}>
                <button
                  onClick={() => onFileSelect(file)}
                  className={selectedFile === file ? 'selected' : ''}
                >
                  {file.split('_')[1].replace('.csv', '')}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>この日のファイルはありません。</p>
        )}
      </div>
    </div>
  );
};

export default CalendarSelector;