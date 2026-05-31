import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import API from "../config";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <div className="notfound__orb notfound__orb--1" />
      <div className="notfound__orb notfound__orb--2" />
      <div className="notfound__orb notfound__orb--3" />

      <div className="notfound__content">
        <div className="notfound__visual shn-anim-1">
          <span className="notfound__num">4</span>
          <div className="notfound__vinyl">
            <div className="notfound__vinyl-grooves" />
            <div className="notfound__vinyl-label">
              <div className="notfound__vinyl-center" />
            </div>
            <div className="notfound__tonearm" />
          </div>
          <span className="notfound__num">4</span>
        </div>

        <div className="notfound__wave shn-anim-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="notfound__wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        <h1 className="notfound__title shn-anim-3">Ova stranica ne postoji</h1>
        <p className="notfound__text shn-anim-4">
          Izgubio/la si se u ritmu. Pjesma koju tražiš nije ovdje —
          možda je uklonjena ili nikad nije ni postojala.
        </p>

        <div className="notfound__actions shn-anim-5">
          <button className="shn-btn shn-btn-primary" style={{ padding:"13px 32px", fontSize:"15px" }} onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Idi na početnu
          </button>
          <button className="shn-btn shn-btn-ghost" style={{ padding:"13px 28px", fontSize:"15px" }} onClick={() => navigate(-1)}>
            ← Nazad
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;