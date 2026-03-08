import { useEffect, useRef } from 'react';
import { socket } from '../lib/socket';

type EventCallback = (data: any) => void;

interface UseSocketOptions {
    enabled?: boolean;
}

export const useSocket = (
    eventName: string,
    callback: EventCallback,
    options: UseSocketOptions = { enabled: true }
) => {
    const savedCallback = useRef<EventCallback>(callback);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!options.enabled) return;

        // Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        }

        const listener = (data: any) => {
            if (savedCallback.current) {
                savedCallback.current(data);
            }
        };

        socket.on(eventName, listener);

        return () => {
            socket.off(eventName, listener);
        };
    }, [eventName, options.enabled]);

    return { socket };
};
