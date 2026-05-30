import { useState, useRef } from "react";
import "./UploadPage.css";

const SUPABASE_URL = "https://omnniawtnvyyunrdnfbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm5pYXd0bnZ5eXVucmRuZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzM0ODAsImV4cCI6MjA5NDE0OTQ4MH0.RWOyxyDts1u8bWtP_d4alD40DLQB_RuKAvdreeZ0zfo";
const JSON_SERVER_URL = "https://backend-service-1024177687549.europe-west3.run.app";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];

const initForm = { title: "", artist: "", genre: "", description: "", year: String(new Date().getFullYear()) };
const initErrors = { title: "", artist: "", genre: "", description: "", year: "", audioFile: "", coverFile: "" };

const UploadPage = () => {
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState(initErrors);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ audio: 0, cover: 0 });
  const [step, setStep] = useState(1); // 1: form, 2: uploading, 3: success
  const [dragOver, setDragOver] = useState(false);
  const audioRef = useRef();
  const coverRef = useRef();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const e = { ...initErrors };
    let ok = true;
    if (!form.title.trim() || form.title.trim().length < 2) { e.title = "Naziv mora imati najmanje 2 karaktera."; ok = false; }
    if (!form.artist.trim()) { e.artist = "Ime artista je obavezno."; ok = false; }
    if (!form.genre) { e.genre = "Odaberi žanr."; ok = false; }
    if (!form.description.trim() || form.description.trim().length < 10) { e.description = "Opis mora imati najmanje 10 karaktera."; ok = false; }
    if (!form.year || isNaN(form.year) || +form.year < 1900 || +form.year > new Date().getFullYear()) {
      e.year = `Godina između 1900 i ${new Date().getFullYear()}.`; ok = false;
    }
    if (!audioFile) { e.audioFile = "Audio fajl je obavezan."; ok = false; }
    setErrors(e);
    return ok;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAudioChange = (file) => {
    if (!file) return;
    if (!["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.type)) {
      setErrors((p) => ({ ...p, audioFile: "Dozvoljeni formati: MP3, WAV, OGG." })); return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((p) => ({ ...p, audioFile: "Fajl ne smije biti veći od 20MB." })); return;
    }
    setAudioFile(file);
    setErrors((p) => ({ ...p, audioFile: "" }));
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((p) => ({ ...p, coverFile: "Dozvoljeni formati: JPG, PNG, WEBP." })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, coverFile: "Slika ne smije biti veća od 5MB." })); return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, coverFile: "" }));
  };

  const uploadToSupabase = async (file, bucket, onProgress) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const buffer = await file.arrayBuffer();
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
      },
      body: buffer,
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Upload nije uspio."); }
    onProgress(100);
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    setStep(2);
    setProgress({ audio: 0, cover: 0 });
    try {
      const audioUrl = await uploadToSupabase(audioFile, "songs", (p) => setProgress((v) => ({ ...v, audio: p })));
      let coverUrl = null;
      if (coverFile) coverUrl = await uploadToSupabase(coverFile, "covers", (p) => setProgress((v) => ({ ...v, cover: p })));

      const res = await fetch(`${JSON_SERVER_URL}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(), artist: form.artist.trim(),
          genre: form.genre, description: form.description.trim(),
          year: parseInt(form.year), audioUrl, coverUrl, plays: 0,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Greška pri spremanju.");
      setStep(3);
    } catch (err) {
      showToast(err.message || "Greška.", "error");
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setForm(initForm);
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setProgress({ audio: 0, cover: 0 });
    setErrors(initErrors);
    setStep(1);
    if (audioRef.current) audioRef.current.value = "";
    if (coverRef.current) coverRef.current.value = "";
  };

  // Drag and drop
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("audio/")) handleAudioChange(file);
  };

  if (step === 3) {
    return (
      <div className="upload">
        <div className="upload__success">
          <div className="upload__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="36" height="36">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="upload__success-title">Pjesma je objavljena!</h2>
          <p className="upload__success-sub">Tvoja muzika je sada dostupna svim korisnicima Shnare platforme.</p>
          <div className="upload__success-btns">
            <button className="shn-btn shn-btn-primary" onClick={handleReset}>Upload još jednu</button>
            <a href="/browse" className="shn-btn shn-btn-ghost">Istraži muziku</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload">
      {toast && (
        <div className={`shn-toast shn-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Background */}
      <div className="upload__bg">
        <div className="upload__orb upload__orb--1" />
        <div className="upload__orb upload__orb--2" />
      </div>

      <div className="upload__inner">
        {/* Header */}
        <div className="upload__header">
          <p className="shn-section-label">Objavi</p>
          <h1 className="upload__title">
            Podijeli svoju <span className="shn-grad-text">muziku</span>
          </h1>
          <p className="upload__subtitle">
            Uploaduj svoju pjesmu i dopri do hiljade muzičkih ljubitelja
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="upload__form">
          {/* Cover + Audio row */}
          <div className="upload__media-row">
            {/* Cover picker */}
            <div className="upload__cover-wrap">
              <div
                className={`upload__cover-picker ${coverPreview ? "upload__cover-picker--filled" : ""}`}
                onClick={() => coverRef.current.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && coverRef.current.click()}
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover" className="upload__cover-img" />
                    <div className="upload__cover-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span>Promijeni</span>
                    </div>
                  </>
                ) : (
                  <div className="upload__cover-placeholder">
                    <div className="upload__cover-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>Cover foto</span>
                    <span className="upload__cover-hint">JPG, PNG · max 5MB</span>
                  </div>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleCoverChange(e.target.files[0])} style={{ display: "none" }} />
              {errors.coverFile && <p className="upload__field-error">{errors.coverFile}</p>}
            </div>

            {/* Fields */}
            <div className="upload__fields">
              <div className="upload__row">
                <div className="upload__field">
                  <label className="upload__label">Naziv pjesme *</label>
                  <input className={`shn-input ${errors.title ? "shn-input--err" : ""}`} type="text" name="title" value={form.title} onChange={handleChange} placeholder="npr. Blinding Lights" />
                  {errors.title && <p className="upload__field-error">{errors.title}</p>}
                </div>
                <div className="upload__field">
                  <label className="upload__label">Artist *</label>
                  <input className={`shn-input ${errors.artist ? "shn-input--err" : ""}`} type="text" name="artist" value={form.artist} onChange={handleChange} placeholder="npr. The Weeknd" />
                  {errors.artist && <p className="upload__field-error">{errors.artist}</p>}
                </div>
              </div>

              <div className="upload__row">
                <div className="upload__field">
                  <label className="upload__label">Žanr *</label>
                  <div className="upload__select-wrap">
                    <select className={`shn-input shn-select ${errors.genre ? "shn-input--err" : ""}`} name="genre" value={form.genre} onChange={handleChange}>
                      <option value="">Odaberi žanr</option>
                      {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <svg className="upload__select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M6 9l6 6 6-6" strokeLinecap="round" /></svg>
                  </div>
                  {errors.genre && <p className="upload__field-error">{errors.genre}</p>}
                </div>
                <div className="upload__field">
                  <label className="upload__label">Godina *</label>
                  <input className={`shn-input ${errors.year ? "shn-input--err" : ""}`} type="number" name="year" value={form.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} />
                  {errors.year && <p className="upload__field-error">{errors.year}</p>}
                </div>
              </div>

              <div className="upload__field">
                <label className="upload__label">Opis *</label>
                <textarea className={`shn-input shn-textarea ${errors.description ? "shn-input--err" : ""}`} name="description" value={form.description} onChange={handleChange} placeholder="Kratki opis pjesme, inspiracija, priča iza nje..." rows={3} />
                {errors.description && <p className="upload__field-error">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Audio dropzone */}
          <div className="upload__audio-section">
            <label className="upload__label">Audio fajl * · MP3, WAV, OGG · max 20MB</label>
            <div
              className={`upload__dropzone ${audioFile ? "upload__dropzone--filled" : ""} ${dragOver ? "upload__dropzone--drag" : ""} ${errors.audioFile ? "upload__dropzone--error" : ""}`}
              onClick={() => audioRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {audioFile ? (
                <div className="upload__audio-selected">
                  <div className="upload__audio-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                      <path d="M9 18V5l12-2v13" strokeLinecap="round" />
                      <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="upload__audio-name">{audioFile.name}</p>
                    <p className="upload__audio-size">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" className="upload__audio-remove" onClick={(e) => { e.stopPropagation(); setAudioFile(null); if (audioRef.current) audioRef.current.value = ""; }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ) : (
                <div className="upload__dropzone-placeholder">
                  <div className="upload__drop-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                      <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="upload__drop-text">Klikni ili prevuci audio fajl ovdje</p>
                  <p className="upload__drop-hint">MP3, WAV ili OGG · Maksimalno 20MB</p>
                </div>
              )}
            </div>
            <input ref={audioRef} type="file" accept="audio/mpeg,audio/wav,audio/ogg" onChange={(e) => handleAudioChange(e.target.files[0])} style={{ display: "none" }} />
            {errors.audioFile && <p className="upload__field-error">{errors.audioFile}</p>}
          </div>

          {/* Upload progress */}
          {step === 2 && (
            <div className="upload__progress-section">
              <div className="upload__progress-item">
                <span className="upload__progress-label">Audio</span>
                <div className="upload__progress-track">
                  <div className="upload__progress-fill" style={{ width: `${progress.audio}%` }} />
                </div>
                <span className="upload__progress-pct">{progress.audio}%</span>
              </div>
              {coverFile && (
                <div className="upload__progress-item">
                  <span className="upload__progress-label">Cover</span>
                  <div className="upload__progress-track">
                    <div className="upload__progress-fill" style={{ width: `${progress.cover}%` }} />
                  </div>
                  <span className="upload__progress-pct">{progress.cover}%</span>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="upload__submit shn-btn shn-btn-primary" disabled={uploading}>
            {uploading ? (
              <><div className="shn-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Uploadovanje...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                </svg>
                Objavi pjesmu
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
