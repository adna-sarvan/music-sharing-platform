import { useState, useEffect } from "react";
import "./AdminPage.css";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];
const API = "http://localhost:3001/songs";

const emptyForm = { title: "", artist: "", genre: "Pop", duration: "", cover: "" };

const AdminPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Greška pri učitavanju.");
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSongs(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.artist) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingId }),
        });
        if (!res.ok) throw new Error("Greška pri ažuriranju.");
        showSuccess("Pjesma uspješno ažurirana!");
      } else {
        const newId = Date.now().toString();
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: newId }),
        });
        if (!res.ok) throw new Error("Greška pri dodavanju.");
        showSuccess("Pjesma uspješno dodana!");
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchSongs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (song) => {
    setForm({ title: song.title, artist: song.artist, genre: song.genre, duration: song.duration, cover: song.cover || "" });
    setEditingId(song.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigurno želiš obrisati ovu pjesmu?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju.");
      showSuccess("Pjesma obrisana.");
      fetchSongs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="admin">
      <div className="admin__header">
        <h1 className="admin__title">
          Admin <span className="admin__title-accent">Panel</span>
        </h1>
        <p className="admin__subtitle">Upravljaj muzičkim sadržajem platforme</p>
      </div>

      {successMsg && <div className="admin__success">✓ {successMsg}</div>}
      {error && <div className="admin__error">⚠️ {error}</div>}

      {/* Form */}
      <div className="admin__form-card">
        <h2 className="admin__form-title">
          {editingId ? "✏️ Uredi pjesmu" : "➕ Dodaj novu pjesmu"}
        </h2>
        <form onSubmit={handleSubmit} className="admin__form">
          <div className="admin__form-row">
            <div className="admin__field">
              <label className="admin__label">Naziv pjesme *</label>
              <input
                className="admin__input"
                type="text"
                placeholder="npr. Midnight City"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="admin__field">
              <label className="admin__label">Izvođač *</label>
              <input
                className="admin__input"
                type="text"
                placeholder="npr. Neon Lights"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="admin__form-row">
            <div className="admin__field">
              <label className="admin__label">Žanr</label>
              <select
                className="admin__input admin__select"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              >
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="admin__field">
              <label className="admin__label">Trajanje</label>
              <input
                className="admin__input"
                type="text"
                placeholder="npr. 3:45"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>
          <div className="admin__field">
            <label className="admin__label">URL naslovnice (opciono)</label>
            <input
              className="admin__input"
              type="text"
              placeholder="https://..."
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
          </div>
          <div className="admin__form-actions">
            {editingId && (
              <button type="button" className="admin__btn admin__btn--cancel" onClick={handleCancel}>
                Otkaži
              </button>
            )}
            <button type="submit" className="admin__btn admin__btn--save" disabled={saving}>
              {saving ? "Čuvanje..." : editingId ? "Sačuvaj izmjene" : "Dodaj pjesmu"}
            </button>
          </div>
        </form>
      </div>

      {/* Songs table */}
      <div className="admin__table-card">
        <div className="admin__table-header">
          <h2 className="admin__form-title">🎵 Sve pjesme</h2>
          <span className="admin__count">{songs.length} ukupno</span>
        </div>

        {loading ? (
          <div className="admin__loading">
            <div className="admin__spinner"></div>
            <p>Učitavanje...</p>
          </div>
        ) : songs.length === 0 ? (
          <p className="admin__empty">Nema pjesama. Dodaj prvu!</p>
        ) : (
          <div className="admin__table-wrapper">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Naslovnica</th>
                  <th>Naziv</th>
                  <th>Izvođač</th>
                  <th>Žanr</th>
                  <th>Trajanje</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song.id} className={editingId === song.id ? "admin__row--editing" : ""}>
                    <td>
                      <img
                        className="admin__cover"
                        src={song.cover || `https://picsum.photos/seed/${song.id}/40/40`}
                        alt={song.title}
                      />
                    </td>
                    <td className="admin__cell-title">{song.title}</td>
                    <td>{song.artist}</td>
                    <td><span className="admin__genre-tag">{song.genre}</span></td>
                    <td>{song.duration}</td>
                    <td>
                      <div className="admin__actions">
                        <button className="admin__action-btn admin__action-btn--edit" onClick={() => handleEdit(song)}>
                          Uredi
                        </button>
                        <button className="admin__action-btn admin__action-btn--delete" onClick={() => handleDelete(song.id)}>
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
