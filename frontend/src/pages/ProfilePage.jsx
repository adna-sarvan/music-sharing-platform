import { useState, useEffect, useRef } from "react";
import SongCard from "../components/SongCard";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import "./ProfilePage.css";
import API from "../config";

const TABS = [
  { id: "songs",     label: "Moje pjesme",   icon: "🎵" },
  { id: "playlists", label: "Playliste",     icon: "📋" },
  { id: "favorites", label: "Omiljeno",      icon: "❤️" },
];

const ProfilePage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("songs");
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [avatarPrev, setAvatarPrev] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", desc: "" });
  const [creatingPl, setCreatingPl] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Pretpostavka: Tabele se zovu 'songs', 'playlists', 'favorites'
      // Prilagodi imena tabela ako se u Supabase drugačije zovu
      const [songsData, playlistsData, favoritesData] = await Promise.all([
        supabase.from("songs").select("*").eq("user_id", user.id),
        supabase.from("playlists").select("*").eq("user_id", user.id),
        supabase.from("favorites").select("*").eq("user_id", user.id)
      ]);

      if (songsData.error) throw songsData.error;
      if (playlistsData.error) throw playlistsData.error;
      if (favoritesData.error) throw favoritesData.error;

      setSongs(songsData.data || []);
      setPlaylists(playlistsData.data || []);
      setFavorites(favoritesData.data || []);
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
      showToast("Greška pri učitavanju podataka.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Ovdje ažuriraj profil u Supabase 'profiles' tabeli
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName })
        .eq('id', user.id);
      
      if (error) throw error;
      showToast("Profil ažuriran!");
      setEditMode(false);
    } catch (err) {
      showToast("Greška pri spremanju.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlaylist = async () => {
    setCreatingPl(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{ 
          name: newPlaylist.name, 
          description: newPlaylist.desc, 
          user_id: user.id 
        }])
        .select();

      if (error) throw error;
      setPlaylists([...playlists, ...data]);
      setShowModal(false);
      showToast("Playlista kreirana!");
    } catch (err) {
      showToast("Greška pri kreiranju.", "error");
    } finally {
      setCreatingPl(false);
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
      setPlaylists(playlists.filter(p => p.id !== id));
      showToast("Obrisano!");
    } catch (err) {
      showToast("Greška pri brisanju.", "error");
    }
  };

  const initials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("bs-BA", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="profile">
      {toast && (
        <div className={`shn-toast shn-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="profile__hero">
        <div className="profile__hero-orb profile__hero-orb--1" />
        <div className="profile__hero-orb profile__hero-orb--2" />
        <div className="profile__hero-orb profile__hero-orb--3" />

        <div className="profile__hero-inner">
          <div className="profile__avatar-wrap">
            {editMode ? (
              <label className="profile__avatar-label" htmlFor="avatarInput">
                {avatarPrev
                  ? <img src={avatarPrev} alt="Avatar" className="profile__avatar-img" />
                  : <div className="profile__avatar-initials">{initials(editName)}</div>
                }
                <div className="profile__avatar-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <input id="avatarInput" ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </label>
            ) : avatarPrev ? (
              <img src={avatarPrev} alt="Avatar" className="profile__avatar-img" />
            ) : (
              <div className="profile__avatar-initials">{initials(user?.name || "Adna Sarvan")}</div>
            )}
          </div>

          <div className="profile__info">
            {editMode ? (
              <input
                className="profile__name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tvoje ime"
              />
            ) : (
              <h1 className="profile__name">{user?.name || "Adna Sarvan"}</h1>
            )}
            <p className="profile__email">{user?.email || "adna@example.com"}</p>
            {user?.createdAt && (
              <p className="profile__joined">Član od {fmtDate(user.createdAt)}</p>
            )}

            <div className="profile__stats">
              {[
                { num: songs.length,     label: "Pjesama"  },
                { num: playlists.length, label: "Playlisti" },
                { num: favorites.length, label: "Omiljenih" },
              ].map(({ num, label }) => (
                <div key={label} className="profile__stat">
                  <span className="profile__stat-num shn-grad-text">{num}</span>
                  <span className="profile__stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile__actions">
            {editMode ? (
              <>
                <button className="shn-btn shn-btn-primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Sprema..." : "Spremi"}
                </button>
                <button className="shn-btn shn-btn-ghost" onClick={() => setEditMode(false)}>
                  Odustani
                </button>
              </>
            ) : (
              <button className="shn-btn shn-btn-ghost" onClick={() => setEditMode(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Uredi profil
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile__tabs-wrap">
        <div className="profile__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`profile__tab ${tab === t.id ? "profile__tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="profile__tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="profile__content">
        {loading ? (
          <div className="shn-loading">
            <div className="shn-spinner" />
            <p style={{ color: "var(--shn-muted)", fontSize: "14px" }}>Učitavanje...</p>
          </div>
        ) : (
          <>
            {tab === "songs" && (
              songs.length > 0 ? (
                <div className="profile__songs-grid">
                  {songs.map((s) => <SongCard key={s.id} song={s} />)}
                </div>
              ) : (
                <div className="shn-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="52" height="52">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                  <p>Još nisi uploadovao/la nijednu pjesmu.</p>
                  <a href="/upload" className="shn-btn shn-btn-primary" style={{ marginTop: 8, fontSize: 13 }}>+ Upload pjesmu</a>
                </div>
              )
            )}

            {tab === "playlists" && (
              <div>
                <div className="profile__section-head">
                  <h2 className="profile__section-title shn-heading">Moje playliste</h2>
                  <button className="shn-btn shn-btn-primary" style={{ fontSize: 13 }} onClick={() => setShowModal(true)}>
                    + Nova playlist
                  </button>
                </div>
                {playlists.length > 0 ? (
                  <div className="profile__playlists">
                    {playlists.map((pl) => (
                      <div key={pl.id} className="profile__pl-card">
                        <div className="profile__pl-icon">🎵</div>
                        <div className="profile__pl-info">
                          <h3 className="profile__pl-name">{pl.name}</h3>
                          {pl.description && <p className="profile__pl-desc">{pl.description}</p>}
                          <span className="profile__pl-meta">
                            {pl.songs?.length || 0} pjesama · {fmtDate(pl.createdAt)}
                          </span>
                        </div>
                        <button className="profile__pl-del" onClick={() => handleDeletePlaylist(pl.id)} title="Obriši">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="shn-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="52" height="52">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" />
                      <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" />
                      <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" />
                    </svg>
                    <p>Nemaš još nijednu playlistu.</p>
                    <button className="shn-btn shn-btn-primary" style={{ marginTop: 8, fontSize: 13 }} onClick={() => setShowModal(true)}>
                      Kreiraj prvu
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "favorites" && (
              <div>
                <h2 className="profile__section-title shn-heading" style={{ marginBottom: 24 }}>Omiljene pjesme & albumi</h2>
                {favorites.length > 0 ? (
                  <div className="profile__playlists">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="profile__pl-card">
                        <div className="profile__pl-icon profile__pl-icon--fav">♪</div>
                        <div className="profile__pl-info">
                          <h3 className="profile__pl-name">{fav.title}</h3>
                          <p className="profile__pl-desc">{fav.artist}</p>
                          {fav.description && (
                            <p className="profile__fav-quote">"{fav.description}"</p>
                          )}
                        </div>
                        <span className="profile__fav-badge">
                          {fav.type === "album" ? "Album" : "Pjesma"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="shn-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="52" height="52">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <p>Još nisi dodao/la omiljene pjesme ili albume.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="profile__modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile__modal-title shn-heading">Nova playlist</h2>
            <div className="profile__modal-field">
              <label className="upload__label">Naziv *</label>
              <input
                className="shn-input"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist((p) => ({ ...p, name: e.target.value }))}
                placeholder="npr. Jutarnje vibracije"
              />
            </div>
            <div className="profile__modal-field">
              <label className="upload__label">Opis (opcionalno)</label>
              <textarea
                className="shn-input shn-textarea"
                value={newPlaylist.desc}
                onChange={(e) => setNewPlaylist((p) => ({ ...p, desc: e.target.value }))}
                placeholder="Kratki opis playliste..."
                rows={3}
              />
            </div>
            <div className="profile__modal-btns">
              <button className="shn-btn shn-btn-ghost" onClick={() => setShowModal(false)}>Odustani</button>
              <button className="shn-btn shn-btn-primary" onClick={handleCreatePlaylist} disabled={creatingPl}>
                {creatingPl ? "Kreiranje..." : "Kreiraj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;