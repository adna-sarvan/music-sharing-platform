import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./AdminPage.css";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Jazz", "Classical", "Indie"];
const empty  = { title: "", artist: "", genre: "Pop", duration: "", cover_url: "" };

const AdminPage = () => {
  const [songs, setSongs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(empty);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, type = "success") => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3200); 
  };

  // Učitavanje svih pjesama iz Supabase-a
  const loadSongs = async () => {
    try { 
      setLoading(true); 
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSongs(data || []); 
    } catch (err) { 
      console.error(err);
      showToast("Greška pri učitavanju podataka.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadSongs(); 
  }, []);

  // Dodavanje ili uređivanje pjesme
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) { 
      showToast("Naziv i artist su obavezni.", "error"); 
      return; 
    }
    
    setSaving(true);
    try {
      if (editId) {
        // Supabase UPDATE
        const { error } = await supabase
          .from("songs")
          .update({
            title: form.title.trim(),
            artist: form.artist.trim(),
            genre: form.genre,
            duration: form.duration.trim(),
            cover_url: form.cover_url.trim()
          })
          .eq("id", editId);

        if (error) throw error;
        showToast("Pjesma ažurirana! ✏️");
      } else {
        // Supabase INSERT
        const { error } = await supabase
          .from("songs")
          .insert([
            {
              title: form.title.trim(),
              artist: form.artist.trim(),
              genre: form.genre,
              duration: form.duration.trim(),
              cover_url: form.cover_url.trim(),
              plays: 0,
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
        showToast("Pjesma dodana! ✅");
      }
      
      setForm(empty); 
      setEditId(null); 
      loadSongs();
    } catch (err) { 
      console.error(err);
      showToast("Greška pri spašavanju.", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  // Postavljanje pjesme u formu za edit
  const handleEdit = (s) => { 
    setForm({ 
      title: s.title || "", 
      artist: s.artist || "", 
      genre: s.genre || "Pop", 
      duration: s.duration || "", 
      cover_url: s.cover_url || s.cover || "" 
    }); 
    setEditId(s.id); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  // Brisanje pjesme iz Supabase-a
  const handleDelete = async (id) => {
    if (!window.confirm("Sigurno želiš obrisati ovu pjesmu?")) return;
    try { 
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("Obrisano! 🗑️"); 
      loadSongs(); 
    } catch (err) { 
      console.error(err);
      showToast("Greška pri brisanju.", "error"); 
    }
  };

  // Filtriranje pjesama kroz pretragu
  const filtered = songs.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin">
      {toast && <div className={`shn-toast shn-toast--${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}
      <div className="admin__orb admin__orb--1"/><div className="admin__orb admin__orb--2"/>

      <div className="admin__inner">
        <div className="admin__header">
          <p className="shn-section-label">Admin</p>
          <h1 className="admin__title">Admin <span className="shn-grad-text">Panel</span></h1>
          <p className="admin__sub">Upravljaj muzičkim sadržajem Shnare platforme</p>
        </div>

        {/* Stats row */}
        <div className="admin__stats">
          {[
            { num: songs.length, label: "Ukupno pjesama" },
            { num: songs.filter(s => (s.plays || 0) >= 1000).length, label: "Popularne (1K+)" },
            { num: [...new Set(songs.map(s => s.genre))].length, label: "Žanrova" }
          ].map(({ num, label }) => (
            <div key={label} className="admin__stat-card">
              <span className="admin__stat-num shn-grad-text">{num}</span>
              <span className="admin__stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="admin__form-card shn-card">
          <h2 className="admin__form-title">{editId ? "✏️ Uredi pjesmu" : "➕ Dodaj novu pjesmu"}</h2>
          <form onSubmit={handleSubmit} className="admin__form">
            <div className="admin__row">
              <div className="contact__field">
                <label className="upload__label">Naziv *</label>
                <input className="shn-input" placeholder="npr. Blinding Lights" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="contact__field">
                <label className="upload__label">Artist *</label>
                <input className="shn-input" placeholder="npr. The Weeknd" value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} />
              </div>
            </div>
            <div className="admin__row">
              <div className="contact__field">
                <label className="upload__label">Žanr</label>
                <div className="upload__select-wrap">
                  <select className="shn-input shn-select" value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}>
                    {GENRES.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <svg className="upload__select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg>
                </div>
              </div>
              <div className="contact__field">
                <label className="upload__label">Trajanje</label>
                <input className="shn-input" placeholder="npr. 3:45" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
              </div>
            </div>
            <div className="contact__field">
              <label className="upload__label">Cover URL (opcionalno)</label>
              <input className="shn-input" placeholder="https://..." value={form.cover_url} onChange={e => setForm(p => ({ ...p, cover_url: e.target.value }))} />
            </div>
            <div className="admin__form-btns">
              {editId && <button type="button" className="shn-btn shn-btn-ghost" onClick={() => { setForm(empty); setEditId(null); }}>Otkaži</button>}
              <button type="submit" className="shn-btn shn-btn-primary" disabled={saving}>{saving ? "Sprema..." : editId ? "Sačuvaj izmjene" : "Dodaj pjesmu"}</button>
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="admin__table-card shn-card">
          <div className="admin__table-head">
            <h2 className="admin__form-title" style={{ margin: 0 }}>🎵 Sve pjesme</h2>
            <div className="admin__search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
              <input className="admin__search" placeholder="Pretraži..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="admin__count">{filtered.length} pjesama</span>
          </div>

          {loading ? (
            <div className="shn-loading"><div className="shn-spinner"/><p style={{ color: "var(--shn-muted)", fontSize: 14 }}>Učitavanje...</p></div>
          ) : filtered.length === 0 ? (
            <div className="shn-empty"><p>{search ? "Nema rezultata." : "Nema pjesama. Dodaj prvu!"}</p></div>
          ) : (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Naziv</th>
                    <th>Artist</th>
                    <th>Žanr</th>
                    <th>Plays</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className={editId === s.id ? "admin__row--editing" : ""}>
                      <td>
                        <div className="admin__cover">
                          {s.cover_url || s.cover ? (
                            <img src={s.cover_url || s.cover} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}/>
                          ) : (
                            <span style={{ fontSize: 18 }}>🎵</span>
                          )}
                        </div>
                      </td>
                      <td className="admin__cell-title">{s.title}</td>
                      <td style={{ color: "var(--shn-muted)" }}>{s.artist}</td>
                      <td><span className="shn-badge">{s.genre}</span></td>
                      <td style={{ color: "var(--shn-muted)", fontSize: 13 }}>{(s.plays || 0).toLocaleString()}</td>
                      <td>
                        <div className="admin__actions">
                          <button className="admin__btn admin__btn--edit" onClick={() => handleEdit(s)}>Uredi</button>
                          <button className="admin__btn admin__btn--del" onClick={() => handleDelete(s.id)}>Obriši</button>
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
    </div>
  );
};

export default AdminPage;