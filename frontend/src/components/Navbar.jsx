import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Navbar.css';

function Navbar() {
    // uzimamo korisnika i logout funkciju iz contexta
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // brišemo korisnika iz contexta i localStorage-a
        navigate('/'); // vraćamo na početnu
    };

    return (
        <nav className="navbar">
            {/* logo / naziv platforme */}
            <Link to="/" className="navbar-logo">
                🎵 Shnare
            </Link>

            {/* linkovi u sredini */}
            <div className="navbar-links">
                <Link to="/browse">Istraži</Link>
                <Link to="/upload">+ Dodaj</Link>
                <Link to="/contact">Kontakt</Link>

                {/* admin link vidljiv samo adminima */}
                {user && user.role === 'admin' && (
                    <Link to="/admin">Admin</Link>
                )}
            </div>

            {/* desna strana - login/logout */}
            <div className="navbar-auth">
                {user ? (
                    // ako je prijavljen, pokazujemo mu ime i logout button
                    <>
                        <Link to="/profile" className="navbar-username">
                            👤 {user.name}
                        </Link>
                        <button onClick={handleLogout} className="navbar-logout">
                            Odjavi se
                        </button>
                    </>
                ) : (
                    // ako nije prijavljen, pokazujemo login i register linkove
                    <>
                        <Link to="/login" className="navbar-login">Prijavi se</Link>
                        <Link to="/register" className="navbar-register">Registruj se</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;