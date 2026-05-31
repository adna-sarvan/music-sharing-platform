import { useState, useRef } from "react";
import "./UploadPage.css";
import API from "../config";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];

const initForm = { title: "", artist: "", genre: "", description: "", year: String(new Date().getFullYear()) };
const initErrors = { title: "", artist: "", genre: "", description: "", year: "" };

const UploadPage = () => {
  const [form, setForm]       = useState(initForm);
  const [errors, setErrors]   = useState(initErrors);
  const [uploading, setUploading] = useState(false);
  const [step, setStep]       = useState(1);
  const [coverFile, setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [toast, setToast]     = useState(null);
  const coverRef = useRef();

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
    setErrors(e);
    return ok;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Dozvoljeni formati: JPG, PNG, WEBP.", "error"); return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    try {
      const res = await fetch(`${API}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          artist: form.artist.trim(),
          genre: form.genre,
          description: form.description.trim(),
          year: parseInt(form.year),
          audioUrl: "",
          coverUrl: "",
          plays: 0,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Greška pri spremanju.");
      setStep(3);
    } catch (err) {
      showToast(err.message || "Greška.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setForm(initForm);
    setCoverFile(null);
    setCoverPreview(null);
    setErrors(initErrors);
    setStep(1);
    if (coverRef.current) coverRef.current.value = "";
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

      <div className="upload__bg">
        <div className="upload__orb upload__orb--1" />
        <div className="upload__orb upload__orb--2" />
      </div>

      <div className="upload__inner">
        <div className="upload__header">
          <p className="shn-section-label">Objavi</p>
          <h1 className="upload__title">Podijeli svoju <span className="shn-grad-text">muziku</span></h1>
          <p className="upload__subtitle">Uploaduj svoju pjesmu i dopri do hiljade muzičkih ljubitelja</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="upload__form">
          <div className="upload__media-row">
            {/* Cover picker */}
            <div className="upload__cover-wrap">
              <div
                className={`upload__cover-picker ${coverPreview ? "upload__cover-picker--filled" : ""}`}
                onClick={() => coverRef.current.click()}
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

          <button type="submit" className="upload__submit shn-btn shn-btn-primary" disabled={uploading}>
            {uploading ? (
              <><div className="shn-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Objavljuje se...</>
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