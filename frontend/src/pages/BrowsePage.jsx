import { useState, useEffect } from "react";
import SongCard from "../components/SongCard";
import "./BrowsePage.css";

const GENRES = ["Sve", "Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];

const BrowsePage = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [activeGenre, setActiveGenre] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/songs");
        if (!res.ok) throw new Error("Greška pri učitavanju pjesama.");
        const data = await res.json();
        setSongs(data);
        setFilteredSongs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    let result = songs;

    if (activeGenre !== "Sve") {
      result = result.filter((s) => s.genre === activeGenre);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }

    setFilteredSongs(result);
  }, [activeGenre, searchQuery, songs]);

  return (
    <div className="browse">
      <div className="browse__header">
        <h1 className="browse__title">
          Istraži <span className="browse__title-accent">muziku</span>
        </h1>
        <p className="browse__subtitle">Pronađi nove zvukove, artiste i žanrove</p>

        <div className="browse__search-wrapper">
          <svg className="browse__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="browse__search"
            placeholder="Pretraži pjesme ili artiste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="browse__search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="browse__genres">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`browse__genre-btn ${activeGenre === genre ? "browse__genre-btn--active" : ""}`}
            onClick={() => setActiveGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading && (
        <div className="browse__loading">
          <div className="browse__spinner"></div>
          <p>Učitavanje pjesama...</p>
        </div>
      )}

      {error && (
        <div className="browse__error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="browse__count">
            {filteredSongs.length} {filteredSongs.length === 1 ? "pjesma" : "pjesama"}
            {activeGenre !== "Sve" && ` u žanru ${activeGenre}`}
            {searchQuery && ` za "${searchQuery}"`}
          </p>

          {filteredSongs.length > 0 ? (
            <div className="browse__grid">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="browse__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <p>Nema pjesama za ovaj odabir.</p>
              <button
                className="browse__reset-btn"
                onClick={() => { setActiveGenre("Sve"); setSearchQuery(""); }}
              >
                Resetuj filtere
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePage;
