import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { SERVER_EVENTS } from '../utils/socketEvents';

/**
 * Room-ready view-model.
 *
 * A guest who arrived before their room was clean is "advance checked in": their
 * folio is open, but there is no key yet. When housekeeping releases the room the
 * server emits `room:ready` ONCE to that guest's own socket room — miss it and
 * they are still standing in the lobby, so the announcement is kept in
 * sessionStorage and survives a reload or a move between screens until they
 * dismiss it.
 *
 * The socket is joined and authorised by SocketContext; this only listens.
 */

const STORAGE_KEY = 'weblink_room_ready';

/** sessionStorage can throw outright (private mode, blocked site data) — never let it. */
const readStored = () => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};
const writeStored = (value) => {
    try {
        if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing to do — the banner still works for this page view.
    }
};

export default function useRoomReadyViewModel() {
    const { socketService, isConnected } = useSocket();
    const [announcement, setAnnouncement] = useState(readStored);

    useEffect(() => {
        // Re-subscribing when the connection flips is what makes this reliable:
        // the socket instance does not exist yet on the first render pass.
        const onRoomReady = (data) => {
            const next = {
                roomNumber: data?.roomNumber ? String(data.roomNumber) : '',
                bookedRoomId: data?.bookedRoomId ? String(data.bookedRoomId) : '',
            };
            writeStored(next);
            setAnnouncement(next);
        };

        socketService.on(SERVER_EVENTS.ROOM_READY, onRoomReady);
        return () => {
            socketService.off(SERVER_EVENTS.ROOM_READY, onRoomReady);
        };
    }, [isConnected, socketService]);

    const dismiss = useCallback(() => {
        writeStored(null);
        setAnnouncement(null);
    }, []);

    return { announcement, dismiss };
}
