import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';


export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Dodajemo loading stanje da ruter sačeka učitavanje

    useEffect(() => {
        try {
            // Pokušavamo učitati korisnika iz localStorage pod ispravnim ključem
            const savedUser = localStorage.getItem('shnare_user');
            if (savedUser && savedUser !== 'undefined') {
                setUser(JSON.parse(savedUser));
            }
        } catch (err) {
            // Ako je podatak neispravan, brišemo ga
            localStorage.removeItem('shnare_user');
        } finally {
            setLoading(false); // Završeno čitanje iz memorije
        }
    }, []);

    const login = async (email, password) => {
        try {
            // Tražimo korisnika u našoj tabeli 'users' na Supabase-u (očišćeno od .where)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                throw new Error('Korisnik sa tim emailom ne postoji.');
            }

            // Provjeravamo da li se šifra poklapa
            if (data.password !== password) {
                throw new Error('Pogrešna šifra.');
            }

            // Sada koristimo ispravan i ujednačen ključ 'shnare_user'
            setUser(data);
            localStorage.setItem('shnare_user', JSON.stringify(data));
            
            return { success: true };

        } catch (err) {
            console.error('Greška pri prijavi:', err.message);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('shnare_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children} 
            {/* Prikazujemo aplikaciju tek kada saznamo da li je korisnik ulogovan */}
        </AuthContext.Provider>
    );
}