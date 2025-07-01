export interface SensorData {
  id: string;
  vehicle_id: string;
  gps_lat: number;
  gps_lng: number;
  temperature?: number;
  fuel_level?: number;
  speed?: number;
  timestamp: string; // Assuming DateTime is serialized as an ISO 8601 string
}