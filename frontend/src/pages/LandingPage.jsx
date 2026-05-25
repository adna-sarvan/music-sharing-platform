import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './LandingPage.css';

function LandingPage() {
    // uzimamo info o prijavljenom korisniku iz contexta
    const { user } = useAuth();

    return (
        <div className="landing-container">

            {/* hero sekcija - glavni dio stranice */}
            <div className="landing-hero">
                <h1 className="landing-title">
                    Otkrij, dijeli i <span>uživaj</span> u muzici
                </h1>
                <p className="landing-subtitle">
                    Platforma za sve ljubitelje muzike. Uploadvaj svoje pjesme,
                    istraži nove zvukove i povežise sa artistima.
                </p>

                {/* prikazujemo različite buttone ovisno o tome je li korisnik prijavljen */}
                <div className="landing-buttons">
                    {user ? (
                        // ako je prijavljen, nudimo mu da istraži ili uploada
                        <>
                            <Link to="/browse" className="btn-primary">Istraži muziku</Link>
                            <Link to="/upload" className="btn-secondary">+ Dodaj pjesmu</Link>
                        </>
                    ) : (
                        // ako nije prijavljen, nudimo registraciju i login
                        <>
                            <Link to="/register" className="btn-primary">Počni besplatno</Link>
                            <Link to="/login" className="btn-secondary">Prijavi se</Link>
                        </>
                    )}
                </div>
            </div>

            {/* sekcija sa 3 kartice - prednosti platforme */}
            <div className="landing-features">
                <div className="feature-card">
                    <div className="feature-icon">🎵</div>
                    <h3>Upload muzike</h3>
                    <p>Podijeli svoje pjesme sa svijetom u nekoliko klikova.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🔍</div>
                    <h3>Istraži žanrove</h3>
                    <p>Pronađi muziku po žanru, artisti ili nazivu pjesme.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">👤</div>
                    <h3>Korisnički profil</h3>
                    <p>Prati svoje uploadovane pjesme i aktivnost na platformi.</p>
                </div>
            </div>

        </div>
    );
}

export default LandingPage;