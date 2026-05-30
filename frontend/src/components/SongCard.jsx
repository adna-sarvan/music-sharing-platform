import { useState, useRef, useEffect } from "react";
import "./SongCard.css";

const SongCard = ({ song, featured = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (song.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(song.audioUrl);
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
          setProgress(0);
          clearInterval(intervalRef.current);
        });
      }
      if (isPlaying) {
        audioRef.current.pause();
        clearInterval(intervalRef.current);
      } else {
        audioRef.current.play().catch(() => {});
        intervalRef.current = setInterval(() => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }, 200);
      }
    } else {
      // Simulate playback if no audio URL
      if (!isPlaying) {
        intervalRef.current = setInterval(() => {
          setProgress((p) => { if (p >= 100) { clearInterval(intervalRef.current); return 0; } return p + 0.5; });
        }, 100);
      } else {
        clearInterval(intervalRef.current);
      }
    }
    setIsPlaying((prev) => !prev);
  };

  const coverColors = [
    "linear-gradient(135deg, #1a0a35 0%, #0d1a40 100%)",
    "linear-gradient(135deg, #1a0530 0%, #400d0d 100%)",
    "linear-gradient(135deg, #041a35 0%, #091a2a 100%)",
    "linear-gradient(135deg, #1a1005 0%, #2a1a04 100%)",
    "linear-gradient(135deg, #0a1a10 0%, #041520 100%)",
    "linear-gradient(135deg, #200a30 0%, #0a0a30 100%)",
  ];
  const colorIndex = (song.id || 0) % coverColors.length;

  return (
    <div
      className={`scard ${featured ? "scard--featured" : ""} ${isPlaying ? "scard--playing" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient glow when playing */}
      {isPlaying && <div className="scard__glow" />}

      {/* Cover */}
      <div className="scard__cover" style={{ background: coverColors[colorIndex] }}>
        {/* Cover image if exists */}
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} className="scard__cover-img" />
        ) : (
          <div className="scard__cover-art">
            <svg viewBox="0 0 60 60" fill="none" className="scard__music-svg">
              <circle cx="30" cy="30" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
              <circle cx="30" cy="30" r="14" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <circle cx="30" cy="30" r="5" fill="currentColor" opacity="0.35" />
              <path d="M30 8C30 8 38 16 38 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              <path d="M30 8C30 8 22 16 22 30" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
            </svg>
          </div>
        )}

        {/* Waveform when playing */}
        {isPlaying && (
          <div className="scard__waveform">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="scard__wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}

        {/* Play button */}
        <button
          className={`scard__play ${isPlaying ? "scard__play--active" : ""}`}
          onClick={handlePlay}
          aria-label={isPlaying ? "Pauziraj" : "Reproduciraj"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <rect x="5" y="3" width="4" height="18" rx="2" />
              <rect x="15" y="3" width="4" height="18" rx="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 4.75l13.5 7.25L6 19.25V4.75z" />
            </svg>
          )}
        </button>

        {/* Progress bar on cover */}
        {(isPlaying || progress > 0) && (
          <div className="scard__progress">
            <div className="scard__progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="scard__info">
        <span className="scard__genre">{song.genre}</span>
        <h3 className="scard__title" title={song.title}>{song.title}</h3>
        <p className="scard__artist">{song.artist}</p>
        <div className="scard__meta">
          <span className="scard__year">{song.year || "2024"}</span>
          <span className="scard__plays">
            <svg viewBox="0 0 12 12" fill="currentColor" width="9" height="9">
              <path d="M3 2.25l7 3.75-7 3.75V2.25z" />
            </svg>
            {(song.plays || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
