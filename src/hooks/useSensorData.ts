import { useState, useEffect } from 'react';
import { realtimeService } from '../services/realtimeService';
import api from '../lib/api';
import { useOfflineData } from './useOfflineData';

interface SensorData {
    id: string;
    vehicleId: string;
    gpsLat: number;
    gpsLng: number;
    temperature: number;
    fuelLevel: number;
    speed: number;
    timestamp: string;
}

const MAX_DATA_POINTS = 100; // Limit the number of data points to keep in the history

const useSensorData = (vehicleId: string) => {
    const [sensorData, setSensorData] = useOfflineData<SensorData[]>({ key: `sensorData-${vehicleId}`, initialValue: [] });
    const [lowFuelAlert, setLowFuelAlert] = useOfflineData<string | null>({ key: `lowFuelAlert-${vehicleId}`, initialValue: null });

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                const response = await api.get<SensorData[]>(`/SensorData/history/${vehicleId}`);
                if (response.data) {
                    setSensorData(response.data.slice(-MAX_DATA_POINTS));
                }
            } catch (error) {
                console.error("Error fetching historical sensor data:", error);
            }
        };

        const handleLowFuelAlert = (alertMessage: string) => {
            setLowFuelAlert(alertMessage);
        };

        // Modified to accept individual parameters
        const handleSensorDataUpdate = (
            vehicleId: string,
            gpsLat: number,
            gpsLng: number,
            temperature: number,
            fuelLevel: number,
            speed: number,
            timestamp: string
        ) => {
            const newSensorData: SensorData = {
                id: `sensor-${vehicleId}-${Date.now()}`, // Generate a unique ID if not provided by the server
                vehicleId,
                gpsLat,
                gpsLng,
                temperature,
                fuelLevel,
                speed,
                timestamp,
            };
            setSensorData(prevData => {
                const newData = [...prevData, newSensorData];
                return newData.slice(-MAX_DATA_POINTS);
            });
        };

        fetchHistoricalData(); // Call historical data fetch on mount

        realtimeService.onReceiveLowFuelAlert(handleLowFuelAlert);
        realtimeService.onReceiveSensorDataUpdate(handleSensorDataUpdate);

        // Cleanup function to unsubscribe from events
        return () => {
            realtimeService.offReceiveLowFuelAlert(handleLowFuelAlert);
            realtimeService.offReceiveSensorDataUpdate(handleSensorDataUpdate);
        };

    }, [vehicleId, setSensorData, setLowFuelAlert]); // Added dependencies for useEffect

    return { sensorData, lowFuelAlert };
};

export default useSensorData;
