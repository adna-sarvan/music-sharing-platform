import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
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
        e.preventDefault(); // spriječavamo reload stranice
        setError('');

        try {
            // prvo provjeravamo da li već postoji korisnik sa tim emailom
            const checkResponse = await fetch(`http://localhost:3001/users?email=${email}`);
            const existingUsers = await checkResponse.json();

            if (existingUsers.length > 0) {
                setError('Korisnik sa tim emailom već postoji.');
                return;
            }

            // kreiramo novog korisnika - šaljemo POST na json-server
            const newUser = {
                name,
                email,
                password,
                role: 'user', // svaki novi korisnik dobija ulogu "user", ne admin
                createdAt: new Date().toISOString()
            };

            const response = await fetch('http://localhost:3001/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const createdUser = await response.json();

            // automatski prijavljujemo korisnika nakon registracije
            login(createdUser);
            navigate('/');
        } catch (err) {
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