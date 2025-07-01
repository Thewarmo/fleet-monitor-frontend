'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService } from '@/services/realtimeService';

interface Alert {
  vehicleId: string;
  message: string;
  timestamp: string;
}

const AlertsDisplay: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const handleLowFuelAlert = (vehicleId: string, message: string) => {
      const newAlert: Alert = {
        vehicleId,
        message,
        timestamp: new Date().toLocaleString(),
      };
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    };

    realtimeService.onReceiveLowFuelAlert(handleLowFuelAlert);

    return () => {
      realtimeService.offReceiveLowFuelAlert(handleLowFuelAlert);
    };
  }, []);

  if (!user || !user.roles.includes('admin')) {
    return null; // Solo visible para administradores
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p className="font-bold">Alertas Predictivas (Solo para Admin)</p>
      {alerts.length === 0 ? (
        <p>No hay alertas de combustible bajo en este momento.</p>
      ) : (
        <ul className="mt-2">
          {alerts.map((alert, index) => (
            <li key={index} className="mb-1">
              <strong>[{alert.timestamp}]</strong> {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsDisplay;
