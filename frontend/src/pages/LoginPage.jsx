import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './LoginPage.css';
import API from "../config";

function LoginPage() {
    // Stanja za polja forme
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Za prikaz grešaka na ekranu

    // Uzimamo zajedničku login funkciju iz našeg AuthContext-a
    const { login } = useAuth();
    const navigate = useNavigate();

    // Ova funkcija se pokreće kada korisnik klikne na dugme "Prijavi se"
    const handleSubmit = async (e) => {
        // 1. Sprječavamo browser da osvježi stranicu i doda "?" u URL
        e.preventDefault(); 
        setError(''); // Čistimo prethodne greške ako ih je bilo

        // 2. Pozivamo login funkciju iz AuthContext-a i šaljemo joj email i lozinku
        const result = await login(email, password);

        if (result.success) {
            // Ako je prijava uspješna, idemo na stranicu za pregled pjesama
            navigate('/browse');
        } else {
            // Ako login vrati grešku (npr. pogrešna šifra), ispisujemo je na ekranu
            setError(result.error || 'Pogrešni podaci za prijavu.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Prijava</h2>
                <p className="auth-subtitle">Dobrodošli nazad!</p>

                {/* Prikazujemo crveni boks sa greškom samo ako error stanje nije prazno */}
                {error && <div className="auth-error" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                {/* Spajamo našu formu sa handleSubmit funkcijom */}
                <form onSubmit={handleSubmit}>
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

                <p className="auth-switch">
                    Nemaš račun? <Link to="/register">Registruj se</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;