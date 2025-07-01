import api from '../lib/api';
import { SensorData } from '../types/sensor';

export const getSensorData = async (vehicleId: string): Promise<SensorData[]> => {
  const response = await api.get<SensorData[]>(`/vehicles/${vehicleId}/sensordata`);
  return response.data;
};

// Add other sensor data-related API calls here