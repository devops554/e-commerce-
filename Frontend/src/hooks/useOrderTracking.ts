import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface LivePartnerLocation {
    currentLocation: {
        latitude: number;
        longitude: number;
    };
    name?: string;
    phone?: string;
}

export const useOrderTracking = (orderId: string | undefined) => {
    const [livePartnerLoc, setLivePartnerLoc] = useState<LivePartnerLocation | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');

    useEffect(() => {
        if (!orderId) return;

        // In Next.js client components, we can use require to avoid SSR issues if needed,
        // but since this is in a useEffect, a normal import is fine.
        const socket = io(backendUrl, {
            auth: {
                userId: 'manager', 
            },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(`[Socket] Connected for order ${orderId}`);
            socket.emit('join-order', { orderId });
        });

        socket.on('location-update', (data: any) => {
            console.log('[Socket] Live location update:', data);
            if (data.location) {
                setLivePartnerLoc({
                    currentLocation: data.location,
                    name: data.partner?.name,
                    phone: data.partner?.phone,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [orderId, backendUrl]);

    return { livePartnerLoc, socket: socketRef.current };
};
