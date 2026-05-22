import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            // pokušavamo učitati korisnika iz localStorage
            const savedUser = localStorage.getItem('shnare_user');
            if (savedUser && savedUser !== 'undefined') {
                setUser(JSON.parse(savedUser));
            }
        } catch (err) {
            // ako je podatak neispravan, brišemo ga
            localStorage.removeItem('shnare_user');
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('shnare_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('shnare_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}