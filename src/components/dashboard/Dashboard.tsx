'use client';

import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import ChartComponent from './ChartComponent';
import AlertsDisplay from './AlertsDisplay';
import useSensorData from '../../hooks/useSensorData';
import useVehicleData from '../../hooks/useVehicleData';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/types/vehicle';

interface DashboardProps {
  // Define props here if any are needed
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Estados locales
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Hook para datos de sensor - solo se ejecuta si hay vehículo seleccionado
  const { sensorData, lowFuelAlert } = useSensorData(selectedVehicle ? selectedVehicle.id : '');

  // Nueva lógica: detectar temperatura alta
  const highTempAlert = sensorData && sensorData.length > 0 && sensorData[sensorData.length - 1].temperature > 94
    ? {
        temperature: sensorData[sensorData.length - 1].temperature,
        timestamp: sensorData[sensorData.length - 1].timestamp,
      }
    : null;

  // Cargar vehículos desde localStorage
  useEffect(() => {
    const loadVehiclesFromStorage = () => {
      if (!userId) {
        setIsLoadingVehicles(false);
        return;
      }

      // Usar la clave correcta (sin la barra inicial)
      const localStorageKey = `api_cache_Vehicles/by-user/${userId}`;
      
      try {
        const storedVehicles = localStorage.getItem(localStorageKey);
        console.log('Clave de localStorage:', localStorageKey);
        console.log('Datos raw del localStorage:', storedVehicles);
        
        if (storedVehicles) {
          const parsedData = JSON.parse(storedVehicles);
          console.log('Datos parseados del localStorage:', parsedData);
          
          // Verificar la estructura específica de tus datos
          let vehicles: Vehicle[] = [];
          
          if (parsedData?.data) {
            // Si parsedData.data es un objeto (un solo vehículo), convertirlo a array
            if (typeof parsedData.data === 'object' && !Array.isArray(parsedData.data)) {
              vehicles = [parsedData.data];
              console.log('Vehículo único convertido a array:', vehicles);
            } 
            // Si parsedData.data es un array
            else if (Array.isArray(parsedData.data)) {
              vehicles = parsedData.data;
              console.log('Array de vehículos encontrado:', vehicles);
            }
          } 
          // Fallback: verificar si hay datos directamente en otras claves
          else {
            console.log('Intentando cargar desde claves alternativas...');
            
            // Intentar cargar desde la clave 'vehicle'
            const vehicleData = localStorage.getItem('vehicle');
            if (vehicleData) {
              try {
                const singleVehicle = JSON.parse(vehicleData);
                vehicles = [singleVehicle];
                console.log('Vehículo cargado desde clave "vehicle":', vehicles);
              } catch (e) {
                console.error('Error parsing vehicle data:', e);
              }
            }
            
            // Si no hay datos en 'vehicle', intentar 'user_vehicles'
            if (vehicles.length === 0) {
              const userVehiclesData = localStorage.getItem('user_vehicles');
              if (userVehiclesData) {
                try {
                  const singleVehicle = JSON.parse(userVehiclesData);
                  vehicles = [singleVehicle];
                  console.log('Vehículo cargado desde clave "user_vehicles":', vehicles);
                } catch (e) {
                  console.error('Error parsing user_vehicles data:', e);
                }
              }
            }
          }

          if (vehicles.length > 0) {
            setUserVehicles(vehicles);
            console.log('Vehículos finales cargados:', vehicles);
            
            // Seleccionar el primer vehículo por defecto si no hay ninguno seleccionado
            if (!selectedVehicle) {
              setSelectedVehicle(vehicles[0]);
              console.log('Vehículo seleccionado por defecto:', vehicles[0]);
            }
          } else {
            console.log('No se encontraron vehículos válidos');
            setUserVehicles([]);
          }
        } else {
          console.log('No hay datos en localStorage para la clave:', localStorageKey);
          setUserVehicles([]);
        }
      } catch (error) {
        console.error('Error al cargar vehículos desde localStorage:', error);
        setUserVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadVehiclesFromStorage();
  }, [userId]);

  // Manejar cambio de vehículo
  const handleVehicleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = event.target.value;
    
    if (!vehicleId) {
      setSelectedVehicle(null);
      return;
    }

    const vehicle = userVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      console.log('Vehículo seleccionado:', vehicle);
    }
  };

  // Preparar datos para los gráficos solo si hay datos de sensor
  const fuelLevelData = sensorData && sensorData.length > 0 ? {
    labels: sensorData.map(data => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Nivel de Combustible',
        data: sensorData.map(data => data.fuelLevel),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  } : null;

  const speedData = sensorData && sensorData.length > 0 ? {
    labels: sensorData.map(data => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Velocidad',
        data: sensorData.map(data => data.speed),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  } : null;

  // Para el mapa, usar las coordenadas GPS del vehículo
  const vehiclesForMap = selectedVehicle ? [{
    id: selectedVehicle.id,
    lat: selectedVehicle.gpsLat || 0, // Usar las coordenadas GPS del localStorage
    lng: selectedVehicle.gpsLng || 0,
    name: selectedVehicle.alias || selectedVehicle.deviceId,
  }] : [];

  if (isLoadingVehicles) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando vehículos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Monitoreo de Flotas</h1>

      {/* Alerta de temperatura alta */}
      {highTempAlert && (
        <div className="mb-6 animate-pulse">
          <div className="bg-gradient-to-r from-red-600 to-yellow-400 text-white rounded-xl shadow-2xl p-6 flex items-center gap-4 border-4 border-red-700">
            <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div className="font-extrabold text-2xl">¡Temperatura Crítica!</div>
              <div className="text-lg font-semibold">La temperatura del motor ha superado los <span className="underline">94°C</span> ({highTempAlert.temperature}°C)</div>
              <div className="text-sm opacity-80">Hora: {new Date(highTempAlert.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700">
          Seleccionar Vehículo:
        </label>
        <select
          id="vehicle-select"
          name="vehicle-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedVehicle?.id || ''}
          onChange={handleVehicleChange}
          disabled={userVehicles.length === 0}
        >
          <option value="">-- Seleccione un vehículo --</option>
          {userVehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.alias || vehicle.deviceId}
            </option>
          ))}
        </select>
        {userVehicles.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No hay vehículos disponibles. Verifique que los datos estén guardados en localStorage.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <AlertsDisplay />
          {lowFuelAlert && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Alerta de Combustible Bajo:</p>
              <p>{lowFuelAlert}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Ubicación de Vehículos</h2>
          {selectedVehicle ? (
            <MapComponent vehicles={vehiclesForMap} />
          ) : (
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Seleccione un vehículo para ver su ubicación</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Datos del Sensor</h2>
          {selectedVehicle ? (
            <div className="space-y-4">
              {fuelLevelData ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Historial de Combustible</h3>
                  <ChartComponent data={fuelLevelData} title="Nivel de Combustible" />
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-800">No hay datos de combustible disponibles</p>
                </div>
              )}

              {speedData ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Historial de Velocidad</h3>
                  <ChartComponent data={speedData} title="Velocidad" />
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-800">No hay datos de velocidad disponibles</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Seleccione un vehículo para ver los datos del sensor</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug info - remover en producción */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium mb-2">Debug Info:</h3>
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {userId}</div>
            <div><strong>Vehículos cargados:</strong> {userVehicles.length}</div>
            <div><strong>Vehículo seleccionado:</strong> {selectedVehicle?.alias || 'Ninguno'}</div>
            <div><strong>ID del vehículo seleccionado:</strong> {selectedVehicle?.id || 'Ninguno'}</div>
            <div><strong>Coordenadas GPS:</strong> {selectedVehicle ? `${selectedVehicle.gpsLat}, ${selectedVehicle.gpsLng}` : 'N/A'}</div>
            <div><strong>Datos de sensor:</strong> {sensorData?.length || 0} registros</div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Ver datos del vehículo seleccionado</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {selectedVehicle ? JSON.stringify(selectedVehicle, null, 2) : 'No hay vehículo seleccionado'}
              </pre>
            </details>
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Ver todas las claves de localStorage</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(Object.keys(localStorage), null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;