import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

/**
 * Decodes the JWT payload (base64url) without verifying the signature.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = atob(base64);
        return JSON.parse(jsonStr);
    } catch {
        return null;
    }
}

const TOKEN_KEY = 'hotel_guest_token';

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        token: null,
        userId: null,
        hotelId: null,
        userType: null,
        isLoading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        // 1. Check if there is a ?token= in the current URL
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');

        if (urlToken) {
            // New token from the magic link – decode and persist it
            const payload = decodeJwtPayload(urlToken);
            if (payload) {
                localStorage.setItem(TOKEN_KEY, urlToken);
                setAuthState({
                    token: urlToken,
                    userId: payload.userId,
                    hotelId: payload.hotelId,
                    userType: payload.userType,
                    isLoading: false,
                    isAuthenticated: true,
                });
                // Clean the token out of the URL bar (cosmetic)
                window.history.replaceState({}, '', window.location.pathname);
                return;
            }
        }

        // 2. No URL token – check localStorage for a previously stored token
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            const payload = decodeJwtPayload(savedToken);
            if (payload) {
                setAuthState({
                    token: savedToken,
                    userId: payload.userId,
                    hotelId: payload.hotelId,
                    userType: payload.userType,
                    isLoading: false,
                    isAuthenticated: true,
                });
                return;
            }
        }

        // 3. No valid token found anywhere
        setAuthState({
            token: null,
            userId: null,
            hotelId: null,
            userType: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    /** Call this on logout to wipe the stored session */
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthState({
            token: null,
            userId: null,
            hotelId: null,
            userType: null,
            isLoading: false,
            isAuthenticated: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...authState, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
