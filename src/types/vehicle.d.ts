export interface Vehicle {
  id: string;
  deviceId: string; // Changed from device_id
  alias?: string;
  user_id: string;
  created_at: string; // Assuming DateTime is serialized as an ISO 8601 string
  gpsLat: number | null;
  gpsLng: number | null;
  fuel_efficiency_km_per_liter: number;
}