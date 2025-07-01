'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../lib/constants';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: -34.397,
  lng: 150.644,
};

interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface MapComponentProps {
  vehicles?: Vehicle[];
}

const MapComponent: React.FC<MapComponentProps> = ({ vehicles }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  useEffect(() => {
    if (map && vehicles && vehicles.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      vehicles.forEach(vehicle => {
        bounds.extend(new window.google.maps.LatLng(vehicle.lat, vehicle.lng));
      });
      map.fitBounds(bounds);
    }
  }, [map, vehicles]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {vehicles && vehicles.map(vehicle => (
        <Marker
          key={vehicle.id}
          position={{ lat: vehicle.lat, lng: vehicle.lng }}
          title={vehicle.name}
          onClick={() => setSelectedVehicle(vehicle)}
        />
      ))}

      {selectedVehicle && (
        <InfoWindow
          position={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
          onCloseClick={() => setSelectedVehicle(null)}
        >
          <div>
            <h4>{selectedVehicle.name}</h4>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div>Loading Map...</div>
  );
};

export default MapComponent;
