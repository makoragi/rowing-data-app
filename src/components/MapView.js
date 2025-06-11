import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 色のリスト（区間ごとに使用）
const COLORS = ['blue', 'green', 'red', 'orange', 'purple', 'cyan'];

const MapView = ({ segments, data, highlightRange }) => {
  const highlightPositions = useMemo(() => {
    if (!highlightRange || !data || data.length === 0) return null;
    const start = Math.max(0, highlightRange.start);
    const end = Math.min(data.length - 1, highlightRange.end);
    const slice = data.slice(start, end + 1);
    return slice.map(coord => [coord.gpsLat, coord.gpsLon]);
  }, [highlightRange, data]);

  if (!segments || segments.length === 0) {
    return <p>地図を表示するためのデータがありません。</p>;
  }

  // 最初の位置（地図の初期表示に使用）
  const position = [segments[0][0].gpsLat, segments[0][0].gpsLon];
  
  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.map(coord => [coord.gpsLat, coord.gpsLon])}
          color={COLORS[index % COLORS.length]} // 色を区間ごとに割り当て
        />
      ))}
      {highlightPositions && (
        <Polyline
          positions={highlightPositions}
          color="yellow"
          weight={6}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
