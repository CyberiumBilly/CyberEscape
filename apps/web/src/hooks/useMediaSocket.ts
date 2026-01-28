import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL || 'http://localhost:3002';

let socket: Socket | null = null;

export function useMediaSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      const token = localStorage.getItem('accessToken');
      socket = io(MEDIA_SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    }
    socketRef.current = socket;

    return () => {
      // Keep connection alive across component mounts
    };
  }, []);

  const emitWithAck = useCallback(<T = any>(event: string, data?: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));
      socketRef.current.emit(event, data, (response: any) => {
        if (response?.error) return reject(new Error(response.error));
        resolve(response as T);
      });
    });
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    socket = null;
  }, []);

  return { socket: socketRef.current, on, emitWithAck, disconnect };
}
