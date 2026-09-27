import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import '../assets/CSS/Map.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// India-focused map settings.
// Leaflet uses [latitude, longitude] — not [longitude, latitude].
const INDIA_CENTER = [22.5937, 78.9629];
const INDIA_BOUNDS = [
  [6.0, 68.0],   // South-West
  [37.5, 97.5]   // North-East
];

const Map = ({ locations = [], longitude, latitude, defaultZoom = 5 }) => {
  // Use the supplied location only when both coordinates are valid.
  // Otherwise, start at the geographical centre of India.
  const hasValidCoordinates =
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

  const defaultPosition = hasValidCoordinates
    ? [Number(latitude), Number(longitude)]
    : INDIA_CENTER;

  return (
    <div className="map-container">
      <MapContainer
        center={defaultPosition}
        zoom={defaultZoom || 5}
        minZoom={4}
        maxZoom={13}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location, idx) => (
          <Marker key={idx} position={location.position}>
            <Popup>{location.popupText}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export { Map };
