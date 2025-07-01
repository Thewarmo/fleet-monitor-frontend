import { useState, useEffect } from 'react';
import { realtimeService } from '../services/realtimeService';
import api from '../lib/api';
import { useOfflineData } from './useOfflineData';

import { Vehicle } from '../types/vehicle';

const useVehicleData = (userId: string) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const fetchVehicleDetails = async () => {
            if (!userId) return;
            try {
                console.log(api);
                const response = await api.get<Vehicle[]>(`Vehicles/by-user/${userId}`);
                if (response.data && response.data.length > 0) {
                    console.log("Fetched vehicles:", response.data);
                    setVehicles(response.data);
                    // Set the first vehicle as selected by default
                    setSelectedVehicle(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
            }
        };

        fetchVehicleDetails();
    }, [userId]);

    useEffect(() => {
        if (selectedVehicle) {
            if (selectedVehicle.gpsLat && selectedVehicle.gpsLng) {
                setCurrentLocation({ lat: selectedVehicle.gpsLat, lng: selectedVehicle.gpsLng });
            }

            const handleVehicleLocationUpdate = (updatedVehicleId: string, lat: number, lng: number) => {
                if (updatedVehicleId === selectedVehicle.id) {
                    setCurrentLocation({ lat, lng });
                }
            };

            realtimeService.onReceiveVehicleLocationUpdate(handleVehicleLocationUpdate);

            // Cleanup function
            return () => {
                realtimeService.offReceiveVehicleLocationUpdate(handleVehicleLocationUpdate);
            };
        }
    }, [selectedVehicle]);

    return { vehicles, selectedVehicle, setSelectedVehicle, currentLocation };
};

export default useVehicleData;
