import { useState } from "react";
import "./SongCard.css";

const SongCard = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="song-card">
      <div className="song-card__cover">
        <div className="song-card__cover-placeholder">
          <svg viewBox="0 0 24 24" fill="none" className="song-card__music-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2C12 2 16 6 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <button
          className={`song-card__play-btn ${isPlaying ? "song-card__play-btn--playing" : ""}`}
          onClick={handlePlay}
          aria-label={isPlaying ? "Pauziraj" : "Reproduciraj"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="song-card__info">
        <span className="song-card__genre">{song.genre}</span>
        <h3 className="song-card__title">{song.title}</h3>
        <p className="song-card__artist">{song.artist}</p>
        <div className="song-card__meta">
          <span className="song-card__duration">{song.duration || "3:45"}</span>
          <span className="song-card__plays">{song.plays || 0} plays</span>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
