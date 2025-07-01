import { useEffect, useRef, useState } from 'react';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:5000/ws'; // Asegúrate de que esta URL sea la correcta para tu backend WebSocket

interface WebSocketServiceOptions {
  onMessage: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  // Add authentication token if needed
  authToken?: string;
}

export const useWebSocket = (options: WebSocketServiceOptions) => {
  const { onMessage, onOpen, onClose, onError, authToken } = options;
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = () => {
      // Append token to URL if needed for authentication
      const url = authToken ? `${WS_BASE_URL}?token=${authToken}` : WS_BASE_URL;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        onClose?.();
        // Optional: Reconnect logic
        // setTimeout(connect, 3000); // Try to reconnect after 3 seconds
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket Error:', event);
        onError?.(event);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onMessage, onOpen, onClose, onError, authToken]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not open. Cannot send message.');
    }
  };

  return { isConnected, sendMessage };
};
