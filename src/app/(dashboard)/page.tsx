'use client';

import { useAuth } from '@/contexts/AuthContext';
import MapComponent from '@/components/dashboard/MapComponent';
import ChartComponent from '@/components/dashboard/ChartComponent';
import AlertsDisplay from '@/components/dashboard/AlertsDisplay';

export default function DashboardPage() {
  const { user } = useAuth();

  // Dummy data for demonstration
  const dummyVehicles = [
    { id: 'vehicle1', lat: -34.397, lng: 150.644, name: 'Truck 001' },
    { id: 'vehicle2', lat: -34.400, lng: 150.650, name: 'Van 002' },
    { id: 'vehicle3', lat: -34.380, lng: 150.630, name: 'Car 003' },
  ];

  const dummyChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Velocidad Promedio (km/h)',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-6">Welcome to the Dashboard, {user?.username}!</h2>
      <p className="mb-4">This is your fleet monitoring dashboard. More content will be added here.</p>
      <div className="mb-8">
        <MapComponent vehicles={dummyVehicles} />
      </div>
      <div className="mb-8">
        <ChartComponent data={dummyChartData} title="Historial de Velocidad" />
      </div>
      <div className="mb-8">
        <AlertsDisplay />
      </div>
    </div>
  );
}
