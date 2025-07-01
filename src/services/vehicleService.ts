import api from '../lib/api';
import { Vehicle } from '../types/vehicle';

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<Vehicle[]>('/vehicles');
  return response.data;
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  const response = await api.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

// Add new function to fetch vehicles by user ID
export const getVehiclesByUserId = async (userId: string): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>(`Vehicles/by-user/${userId}`);
    return response.data;
};

// Add other vehicle-related API calls here
