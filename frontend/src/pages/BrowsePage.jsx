import { useState, useEffect, useRef } from "react";
import SongCard from "../components/SongCard";
import "./BrowsePage.css";

const GENRES = ["Sve", "Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];

const BrowsePage = () => {
  const [songs, setSongs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [genre, setGenre] = useState("Sve");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://backend-service-1024177687549.europe-west3.run.app/songs");
        if (!res.ok) throw new Error("Greška pri učitavanju.");
        const data = await res.json();
        setSongs(data);
        setFiltered(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Mouse spotlight effect on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let result = songs;
    if (genre !== "Sve") result = result.filter((s) => s.genre === genre);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) => s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [genre, query, songs]);

  const genreCounts = GENRES.reduce((acc, g) => {
    acc[g] = g === "Sve" ? songs.length : songs.filter((s) => s.genre === g).length;
    return acc;
  }, {});

  return (
    <div className="browse">
      {/* Hero / search header */}
      <header className="browse__hero" ref={heroRef}>
        {/* Ambient orbs */}
        <div className="browse__orb browse__orb--1" />
        <div className="browse__orb browse__orb--2" />
        <div className="browse__orb browse__orb--3" />

        {/* Mouse spotlight */}
        <div
          className="browse__spotlight"
          style={{ left: spotlight.x, top: spotlight.y }}
        />

        <div className="browse__hero-content">
          <p className="browse__label shn-section-label shn-anim-1">Istraži muziku</p>
          <h1 className="browse__title shn-anim-2">
            Pronađi zvuk koji{" "}
            <span className="shn-grad-text">osjećaš</span>
          </h1>
          <p className="browse__subtitle shn-anim-3">
            {songs.length} pjesama · {GENRES.length - 1} žanrova
          </p>

          {/* Search */}
          <div className="browse__search-wrap shn-anim-4">
            <div className="browse__search-box">
              <svg className="browse__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="browse__search-input"
                placeholder="Pretraži pjesme, artiste..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="browse__search-clear" onClick={() => setQuery("")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Genre pills */}
      <div className="browse__genres shn-anim-5">
        <div className="browse__genres-scroll">
          {GENRES.map((g) => (
            <button
              key={g}
              className={`browse__genre-pill ${genre === g ? "browse__genre-pill--active" : ""}`}
              onClick={() => setGenre(g)}
            >
              {g}
              {genreCounts[g] > 0 && (
                <span className="browse__genre-count">{genreCounts[g]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="browse__main">
        {loading && (
          <div className="shn-loading">
            <div className="shn-spinner" />
            <p style={{ color: "var(--shn-muted)", fontSize: "14px" }}>Učitavanje pjesama...</p>
          </div>
        )}

        {error && (
          <div className="browse__error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" opacity="0.4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="browse__results-bar">
              <span className="browse__results-count">
                <span className="browse__results-num">{filtered.length}</span>
                {filtered.length === 1 ? " pjesma" : " pjesama"}
                {genre !== "Sve" && (
                  <span className="browse__results-filter"> · {genre}</span>
                )}
                {query && (
                  <span className="browse__results-filter"> · "{query}"</span>
                )}
              </span>
            </div>

            {filtered.length > 0 ? (
              <div className="browse__grid">
                {filtered.map((song, i) => (
                  <div
                    key={song.id}
                    className="browse__grid-item"
                    style={{ animationDelay: `${(i % 12) * 0.05}s` }}
                  >
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="shn-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="52" height="52">
                  <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <p>Nema rezultata. Pokušaj drugačiji filter.</p>
                <button
                  className="shn-btn shn-btn-ghost"
                  style={{ marginTop: "8px", fontSize: "13px" }}
                  onClick={() => { setGenre("Sve"); setQuery(""); }}
                >
                  Resetuj filtere
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BrowsePage;
