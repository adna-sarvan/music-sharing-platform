import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './LoginPage.css';

function LoginPage() {
    // stanja za polja forme
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // poruka greške ako login ne uspije

    // uzimamo login funkciju iz AuthContext-a
    const { login } = useAuth();

    // za preusmjeravanje na drugu stranicu nakon prijave
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // da se stranica ne reloada pri submitu forme
        setError('');

        try {
            // tražimo korisnika u bazi po emailu i lozinki
            const response = await fetch(`http://localhost:3001/users?email=${email}&password=${password}`);
            const users = await response.json();

            // ako nema rezultata, kombinacija email/lozinka nije ispravna
            if (users.length === 0) {
                setError('Pogrešan email ili lozinka.');
                return;
            }

            // spremamo korisnika u context i idemo na početnu
            login(users[0]);
            navigate('/');
        } catch (err) {
            setError('Greška pri povezivanju sa serverom.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Prijava</h2>
                <p className="auth-subtitle">Dobrodošli nazad!</p>

                {/* prikazujemo grešku samo ako postoji */}
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleLogin}>
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

                    <button type="submit" className="auth-btn">Prijavi se</button>
                </form>

                {/* link za registraciju ako korisnik nema račun */}
                <p className="auth-switch">
                    Nemaš račun? <Link to="/register">Registruj se</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;