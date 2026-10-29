import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: true });

export function useSocket(events = {}) {
  const [lastUpdated, setLastUpdated] = useState(null);
  useEffect(() => {
    const wrap = {};
    Object.entries(events).forEach(([event, handler]) => {
      wrap[event] = (payload) => {
        setLastUpdated(new Date());
        handler?.(payload);
      };
      socket.on(event, wrap[event]);
    });
    socket.on('systemLive', () => setLastUpdated(new Date()));
    return () => {
      Object.entries(wrap).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, []);
  return { socket, lastUpdated };
}
