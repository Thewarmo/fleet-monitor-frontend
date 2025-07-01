import * as signalR from '@microsoft/signalr';

// Define callback types for type safety
type SensorDataUpdateCallback = (
    vehicleId: string,
    gpsLat: number,
    gpsLng: number,
    temperature: number,
    fuelLevel: number,
    speed: number,
    timestamp: string
) => void;

type LowFuelAlertCallback = (vehicleId: string, message: string) => void;

type VehicleLocationUpdateCallback = (
    vehicleId: string,
    lat: number,
    lng: number
) => void;

class RealtimeService {
    private connection: signalR.HubConnection | null = null;

    public startConnection(token: string): Promise<void> {
        const SIGNALR_BASE_URL = process.env.NEXT_PUBLIC_SIGNALR_BASE_URL;
        const hubUrl = `${SIGNALR_BASE_URL}/monitorhub`;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onclose(async () => {
            console.log("SignalR connection closed.");
        });

        return this.connection.start()
            .then(() => console.log("SignalR Connected!"))
            .catch(err => console.error("SignalR Connection Error: ", err));
    }

    public stopConnection(): Promise<void> {
        if (this.connection) {
            return this.connection.stop()
                .then(() => console.log("SignalR Disconnected."))
                .catch(err => console.error("SignalR Disconnection Error: ", err));
        }
        return Promise.resolve();
    }

    // --- Low Fuel Alert Methods ---
    public onReceiveLowFuelAlert(callback: LowFuelAlertCallback): void {
        if (this.connection) {
            this.connection.on("ReceiveLowFuelAlert", callback);
        }
    }

    public offReceiveLowFuelAlert(callback: LowFuelAlertCallback): void {
        if (this.connection) {
            this.connection.off("ReceiveLowFuelAlert", callback);
        }
    }

    // --- Sensor Data Update Methods ---
    public onReceiveSensorDataUpdate(callback: SensorDataUpdateCallback): void {
        if (this.connection) {
            // The string "ReceiveSensorDataUpdate" must match the method name used in the backend SignalR hub
            this.connection.on("ReceiveSensorDataUpdate", callback);
        }
    }

    public offReceiveSensorDataUpdate(callback: SensorDataUpdateCallback): void {
        if (this.connection) {
            this.connection.off("ReceiveSensorDataUpdate", callback);
        }
    }

    // --- Vehicle Location Update Methods ---
    public onReceiveVehicleLocationUpdate(callback: VehicleLocationUpdateCallback): void {
        if (this.connection) {
            // The string "ReceiveVehicleLocationUpdate" must match the method name used in the backend SignalR hub
            this.connection.on("ReceiveVehicleLocationUpdate", callback);
        }
    }

    public offReceiveVehicleLocationUpdate(callback: VehicleLocationUpdateCallback): void {
        if (this.connection) {
            this.connection.off("ReceiveVehicleLocationUpdate", callback);
        }
    }
}

export const realtimeService = new RealtimeService();
