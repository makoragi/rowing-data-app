import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// カスタムアイコンを作成
const createIcon = (label) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:#2e8b57; color:white; border-radius: 50%; padding: 5px;">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const COLORS = ['blue', 'green', 'red', 'orange', 'purple', 'cyan'];

const MapView = ({ segments }) => {
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

      {/* セグメントの描画 */}
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.map(coord => [coord.gpsLat, coord.gpsLon])}
          color={COLORS[index % COLORS.length]}
        />
      ))}

      {/* スタート地点のマーカー */}
      <Marker
        position={[segments[0][0].gpsLat, segments[0][0].gpsLon]}
        icon={createIcon('S')}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
          スタート地点
        </Tooltip>
      </Marker>

      {/* 各1000m終了地点のマーカー */}
      {segments.map((segment, index) => (
        <Marker
          key={`segment-end-${index}`}
          position={[segment[segment.length - 1].gpsLat, segment[segment.length - 1].gpsLon]}
          icon={createIcon((index + 1).toString())}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            {`${(index + 1) * 1000}m地点`}
          </Tooltip>
        </Marker>
      ))}

      {/* ゴール地点のマーカー */}
      <Marker
        position={[segments[segments.length - 1][segments[segments.length - 1].length - 1].gpsLat,
                   segments[segments.length - 1][segments[segments.length - 1].length - 1].gpsLon]}
        icon={createIcon('G')}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
          ゴール地点
        </Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
