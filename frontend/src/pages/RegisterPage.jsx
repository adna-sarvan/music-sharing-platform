import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import './LoginPage.css'; // koristimo isti css kao za login, nema potrebe pisati novi

function RegisterPage() {
    // stanja za sva polja forme
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Čistimo stare greške

    try {
        // 1. Prvo provjeravamo da li korisnik sa tim emailom već postoji u Supabase-u
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle(); // maybeSingle neće baciti grešku 406 ako nema nikoga

        if (existingUser) {
            setError('Korisnik sa ovim emailom već postoji!');
            return;
        }

        // 2. Ako ne postoji, upisujemo novog korisnika u tabelu 'users'
        const { error: insertError } = await supabase
            .from('users')
            .insert([
                { 
                    id: crypto.randomUUID(),
                    name: name,
                    email: email, 
                    password: password, 
                    role: 'user' // podrazumijevana uloga
                }
            ]);

        if (insertError) throw insertError;

        // 3. Ako je registracija uspješna, preusmjeri ga odmah na login stranicu
        alert('Registracija uspješna! Sada se možete prijaviti.');
        navigate('/login');

    } catch (err) {
        console.error('Greška pri registraciji:', err.message);
        setError('Greška pri registraciji. Pokušaj ponovo.');
    }
};

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Registracija</h2>
                <p className="auth-subtitle">Kreiraj novi račun</p>

                {/* greška se prikazuje samo ako postoji */}
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Ime i prezime</label>
                        <input
                            type="text"
                            placeholder="Ime Prezime"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="vas@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Lozinka</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">Registruj se</button>
                </form>

                {/* link nazad na login */}
                <p className="auth-switch">
                    Već imaš račun? <Link to="/login">Prijavi se</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;