import { io } from 'socket.io-client';

// The URL should point to the NestJS backend
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Notice we strip '/api' if NEXT_PUBLIC_API_URL includes it, but socket.io usually runs on the root domain
const backendUrl = SOCKET_URL.replace('/api', '');

export const socket = io(backendUrl, {
    autoConnect: false, // Prevent immediate connection; let the hook control it
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});
