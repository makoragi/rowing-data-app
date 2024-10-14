import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ coordinates }) => {
  if (!coordinates || coordinates.length === 0) {
    return <p>地図を表示するためのデータがありません。</p>;
  }

  const position = [coordinates[0].gpsLat, coordinates[0].gpsLon];
  
  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline
        positions={coordinates.map(coord => [coord.gpsLat, coord.gpsLon])}
        color="blue"
      />
    </MapContainer>
  );
};

export default MapView;
