import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './LandingPage.css';

const FEATURES = [
  { icon: '🎵', title: 'Upload & Dijeli', desc: 'Objavi svoje pjesme u MP3, WAV ili OGG formatu i dopri do hiljade slušalaca u par klikova.' },
  { icon: '🔍', title: 'Pametna Pretraga', desc: 'Filtriraj po žanru, artistu ili nazivu. Pronađi točno ono što tražiš za manje od sekunde.' },
  { icon: '📋', title: 'Playliste', desc: 'Kreiraj vlastite playliste, dodaj omiljene pjesme i slušaj bez prekida gdje god se nalaziš.' },
  { icon: '⭐', title: 'Ocjene & Komentari', desc: 'Ocijeni pjesme, ostavi povratnu informaciju i povežise s artistima direktno na platformi.' },
  { icon: '👤', title: 'Korisnički Profil', desc: 'Tvoj profil, tvoje pjesme, tvoje playliste. Sve na jednom mjestu s preglednim dashboardom.' },
  { icon: '🛡️', title: 'Admin Panel', desc: 'Admini imaju potpunu kontrolu nad sadržajem platforme uz CRUD operacije u realnom vremenu.' },
];

const STATS = [
  { num: '12K+', label: 'Korisnika' },
  { num: '48K+', label: 'Pjesama'  },
  { num: '320+', label: 'Artista'  },
  { num: '8',    label: 'Žanrova'  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setSpotlight({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="landing">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="landing__hero" ref={heroRef}>
        <div className="landing__orb landing__orb--1" />
        <div className="landing__orb landing__orb--2" />
        <div className="landing__orb landing__orb--3" />
        <div className="landing__spotlight" style={{ left: spotlight.x, top: spotlight.y }} />

        {/* Animated waveform bg */}
        <div className="landing__bg-wave">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="landing__bg-bar" style={{ animationDelay: `${i * 0.12}s`, animationDuration: `${1.2 + (i % 3) * 0.3}s` }} />
          ))}
        </div>

        <div className="landing__hero-inner">
          {/* Badge */}
          <div className="landing__badge shn-anim-1">
            <span className="landing__badge-dot" />
            Share Your Sound
          </div>

          {/* Headline */}
          <h1 className="landing__headline shn-anim-2">
            Muzika koja<br />
            <span className="shn-grad-text">spaja ljude</span>
          </h1>

          <p className="landing__sub shn-anim-3">
            Platforma gdje artisti dijele svoje zvukove, a fanovi otkrivaju novu muziku.
            Uploaduj, slušaj, poveži se.
          </p>

          {/* CTA buttons */}
          <div className="landing__btns shn-anim-4">
            {user ? (
              <>
                <Link to="/browse" className="shn-btn shn-btn-primary landing__btn-lg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  Istraži muziku
                </Link>
                <Link to="/upload" className="shn-btn shn-btn-ghost landing__btn-lg">
                  + Objavi pjesmu
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="shn-btn shn-btn-primary landing__btn-lg">
                  Počni besplatno
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/login" className="shn-btn shn-btn-ghost landing__btn-lg">
                  Prijavi se
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="landing__stats shn-anim-5">
            {STATS.map(({ num, label }) => (
              <div key={label} className="landing__stat">
                <span className="landing__stat-num shn-grad-text">{num}</span>
                <span className="landing__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="landing__scroll-hint">
          <div className="landing__scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="landing__features">
        <div className="landing__features-inner">
          <div className="landing__section-head">
            <p className="shn-section-label">Zašto Shnare?</p>
            <h2 className="landing__section-title">
              Sve što trebaš<br />
              <span className="shn-grad-text">na jednom mjestu</span>
            </h2>
            <p className="landing__section-sub">
              Jednostavan upload, moćna pretraga i zajednica koja voli muziku koliko i ti.
            </p>
          </div>

          <div className="landing__grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="landing__card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="landing__card-icon">{f.icon}</div>
                <h3 className="landing__card-title">{f.title}</h3>
                <p className="landing__card-desc">{f.desc}</p>
                <div className="landing__card-shine" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section className="landing__cta">
        <div className="landing__cta-orb" />
        <div className="landing__cta-inner">
          {/* Mini waveform */}
          <div className="landing__cta-wave">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="landing__cta-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <h2 className="landing__cta-title">
            Spreman/a da dijeliš<br />
            <span className="shn-grad-text">svoju muziku?</span>
          </h2>
          <p className="landing__cta-sub">
            Pridruži se hiljadama artista koji već dijele svoju muziku na Shnare platformi.
          </p>
          <div className="landing__cta-btns">
            {user ? (
              <Link to="/upload" className="shn-btn shn-btn-primary landing__btn-lg">
                + Upload pjesmu
              </Link>
            ) : (
              <>
                <Link to="/register" className="shn-btn shn-btn-primary landing__btn-lg">Kreiraj račun besplatno</Link>
                <Link to="/browse"   className="shn-btn shn-btn-ghost   landing__btn-lg">Istraži muziku</Link>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;