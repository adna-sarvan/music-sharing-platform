import { useState, useRef } from "react";
import "./UploadPage.css";

const SUPABASE_URL = "https://omnniawtnvyyunrdnfbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm5pYXd0bnZ5eXVucmRuZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzM0ODAsImV4cCI6MjA5NDE0OTQ4MH0.RWOyxyDts1u8bWtP_d4alD40DLQB_RuKAvdreeZ0zfo";
const JSON_SERVER_URL = "http://localhost:3001";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];

const initialForm = {
  title: "",
  artist: "",
  genre: "",
  description: "",
  year: new Date().getFullYear().toString(),
};

const initialErrors = {
  title: "",
  artist: "",
  genre: "",
  description: "",
  year: "",
  audioFile: "",
  coverFile: "",
};

const UploadPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ audio: 0, cover: 0 });
  const [toast, setToast] = useState(null);

  const audioRef = useRef();
  const coverRef = useRef();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const newErrors = { ...initialErrors };
    let valid = true;

    if (!form.title.trim()) {
      newErrors.title = "Naziv pjesme je obavezan.";
      valid = false;
    } else if (form.title.trim().length < 2) {
      newErrors.title = "Naziv mora imati najmanje 2 karaktera.";
      valid = false;
    }

    if (!form.artist.trim()) {
      newErrors.artist = "Ime artista je obavezno.";
      valid = false;
    }

    if (!form.genre) {
      newErrors.genre = "Odaberi žanr.";
      valid = false;
    }

    if (!form.description.trim()) {
      newErrors.description = "Opis je obavezan.";
      valid = false;
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Opis mora imati najmanje 10 karaktera.";
      valid = false;
    }

    if (!form.year || isNaN(form.year) || form.year < 1900 || form.year > new Date().getFullYear()) {
      newErrors.year = `Unesite godinu između 1900 i ${new Date().getFullYear()}.`;
      valid = false;
    }

    if (!audioFile) {
      newErrors.audioFile = "Audio fajl je obavezan.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, audioFile: "Dozvoljeni formati: MP3, WAV, OGG." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, audioFile: "Fajl ne smije biti veći od 20MB." }));
      return;
    }
    setAudioFile(file);
    setErrors((prev) => ({ ...prev, audioFile: "" }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, coverFile: "Dozvoljeni formati: JPG, PNG, WEBP." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverFile: "Slika ne smije biti veća od 5MB." }));
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, coverFile: "" }));
  };

  const uploadToSupabase = async (file, bucket, onProgress) => {
    // Kreiramo jedinstveno ime fajla
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;

    // KLJUČNI KORAK: Pretvaramo fajl u binarni ArrayBuffer koji Supabase zahtijeva
    const arrayBuffer = await file.arrayBuffer();

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        // Za sirovi binarni upload koristi se octet-stream ili prazno da API sam prepozna
        "Content-Type": "application/octet-stream", 
        "x-upsert": "true",
      },
      body: arrayBuffer, // Šaljemo čiste binarne podatke
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Upload u bucket "${bucket}" nije uspio.`);
    }

    onProgress(100);
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    setUploadProgress({ audio: 0, cover: 0 });

    try {
      const audioUrl = await uploadToSupabase(audioFile, "songs", (p) =>
        setUploadProgress((prev) => ({ ...prev, audio: p }))
      );

      let coverUrl = null;
      if (coverFile) {
        coverUrl = await uploadToSupabase(coverFile, "covers", (p) =>
          setUploadProgress((prev) => ({ ...prev, cover: p }))
        );
      }

      const songData = {
        title: form.title.trim(),
        artist: form.artist.trim(),
        genre: form.genre,
        description: form.description.trim(),
        year: parseInt(form.year),
        audioUrl,
        coverUrl,
        plays: 0,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(`${JSON_SERVER_URL}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songData),
      });

      if (!res.ok) throw new Error("Greška pri spremanju podataka.");

      showToast("Pjesma je uspješno uploadovana! 🎵");
      setForm(initialForm);
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setUploadProgress({ audio: 0, cover: 0 });
      audioRef.current.value = "";
      coverRef.current.value = "";
    } catch (err) {
      showToast(err.message || "Došlo je do greške.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload">
      {toast && (
        <div className={`upload__toast upload__toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      <div className="upload__header">
        <h1 className="upload__title">
          Upload <span className="upload__title-accent">pjesmu</span>
        </h1>
        <p className="upload__subtitle">Podijeli svoju muziku sa svijetom</p>
      </div>

      <form className="upload__form" onSubmit={handleSubmit} noValidate>
        {/* Cover upload */}
        <div className="upload__cover-section">
          <div
            className="upload__cover-preview"
            onClick={() => coverRef.current.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" />
            ) : (
              <div className="upload__cover-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Dodaj cover</span>
              </div>
            )}
          </div>
          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            style={{ display: "none" }}
          />
          {errors.coverFile && <p className="upload__error">{errors.coverFile}</p>}
        </div>

        {/* Fields */}
        <div className="upload__fields">
          <div className="upload__row">
            <div className="upload__field">
              <label className="upload__label">Naziv pjesme *</label>
              <input
                className={`upload__input ${errors.title ? "upload__input--error" : ""}`}
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="npr. Blinding Lights"
              />
              {errors.title && <p className="upload__error">{errors.title}</p>}
            </div>

            <div className="upload__field">
              <label className="upload__label">Artist *</label>
              <input
                className={`upload__input ${errors.artist ? "upload__input--error" : ""}`}
                type="text"
                name="artist"
                value={form.artist}
                onChange={handleChange}
                placeholder="npr. The Weeknd"
              />
              {errors.artist && <p className="upload__error">{errors.artist}</p>}
            </div>
          </div>

          <div className="upload__row">
            <div className="upload__field">
              <label className="upload__label">Žanr *</label>
              <select
                className={`upload__select ${errors.genre ? "upload__input--error" : ""}`}
                name="genre"
                value={form.genre}
                onChange={handleChange}
              >
                <option value="">Odaberi žanr</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.genre && <p className="upload__error">{errors.genre}</p>}
            </div>

            <div className="upload__field">
              <label className="upload__label">Godina izdanja *</label>
              <input
                className={`upload__input ${errors.year ? "upload__input--error" : ""}`}
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.year && <p className="upload__error">{errors.year}</p>}
            </div>
          </div>

          <div className="upload__field">
            <label className="upload__label">Opis *</label>
            <textarea
              className={`upload__textarea ${errors.description ? "upload__input--error" : ""}`}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Kratki opis pjesme, inspiracija, priča iza nje..."
              rows={4}
            />
            {errors.description && <p className="upload__error">{errors.description}</p>}
          </div>

          {/* Audio upload */}
          <div className="upload__field">
            <label className="upload__label">Audio fajl * (MP3, WAV, OGG – max 20MB)</label>
            <div
              className={`upload__dropzone ${audioFile ? "upload__dropzone--filled" : ""} ${errors.audioFile ? "upload__dropzone--error" : ""}`}
              onClick={() => audioRef.current.click()}
            >
              {audioFile ? (
                <div className="upload__file-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span>{audioFile.name}</span>
                  <span className="upload__file-size">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div className="upload__dropzone-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                  </svg>
                  <span>Klikni za odabir audio fajla</span>
                </div>
              )}
            </div>
            <input
              ref={audioRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg"
              onChange={handleAudioChange}
              style={{ display: "none" }}
            />
            {errors.audioFile && <p className="upload__error">{errors.audioFile}</p>}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="upload__progress">
              <div className="upload__progress-item">
                <span>Audio</span>
                <div className="upload__progress-bar">
                  <div className="upload__progress-fill" style={{ width: `${uploadProgress.audio}%` }} />
                </div>
                <span>{uploadProgress.audio}%</span>
              </div>
              {coverFile && (
                <div className="upload__progress-item">
                  <span>Cover</span>
                  <div className="upload__progress-bar">
                    <div className="upload__progress-fill" style={{ width: `${uploadProgress.cover}%` }} />
                  </div>
                  <span>{uploadProgress.cover}%</span>
                </div>
              )}
            </div>
          )}

          <button className="upload__submit" type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <span className="upload__spinner"></span>
                Uploadovanje...
              </>
            ) : (
              "Objavi pjesmu"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
