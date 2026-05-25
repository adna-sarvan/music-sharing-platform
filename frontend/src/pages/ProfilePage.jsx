import { useState, useEffect } from "react";
import SongCard from "../components/SongCard";
import "./ProfilePage.css";
import useAuth from "../hooks/useAuth"; // koristimo naš hook umjesto mock korisnika


const JSON_SERVER_URL = "http://localhost:3001";
const SUPABASE_URL = "https://omnniawtnvyyunrdnfbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm5pYXd0bnZ5eXVucmRuZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzM0ODAsImV4cCI6MjA5NDE0OTQ4MH0.RWOyxyDts1u8bWtP_d4alD40DLQB_RuKAvdreeZ0zfo";

const TABS = ["Moje pjesme", "Playliste", "Omiljeno"];

const ProfilePage = () => {
  const { user } = useAuth(); // uzimamo pravog prijavljenog korisnika
  const [activeTab, setActiveTab] = useState("Moje pjesme");
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editAvatar, setEditAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [songsRes, playlistsRes, favRes] = await Promise.all([
          fetch(`${JSON_SERVER_URL}/songs?userId=${user.id}`),
          fetch(`${JSON_SERVER_URL}/playlists?userId=${user.id}`),
          fetch(`${JSON_SERVER_URL}/favorites?userId=${user.id}`),
        ]);
        setSongs(await songsRes.json());
        setPlaylists(await playlistsRes.json());
        setFavorites(await favRes.json());
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      let avatarUrl = user.avatar;

      if (editAvatar) {
        const fileName = `avatars/${user.id}-${Date.now()}.${editAvatar.name.split(".").pop()}`;
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/covers/${fileName}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": editAvatar.type,
            "x-upsert": "true",
          },
          body: editAvatar,
        });
        if (res.ok) {
          avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/covers/${fileName}`;
        }
      }

      await fetch(`${JSON_SERVER_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), avatar: avatarUrl }),
      });

      showToast("Profil uspješno ažuriran!");
      setEditMode(false);
    } catch (err) {
      showToast("Greška pri ažuriranju profila.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const res = await fetch(`${JSON_SERVER_URL}/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDesc.trim(),
          userId: user.id,
          songs: [],
          createdAt: new Date().toISOString(),
        }),
      });
      const newPlaylist = await res.json();
      setPlaylists((prev) => [...prev, newPlaylist]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowPlaylistModal(false);
      showToast("Playlist kreirana! 🎵");
    } catch (err) {
      showToast("Greška pri kreiranju playliste.", "error");
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await fetch(`${JSON_SERVER_URL}/playlists/${id}`, { method: "DELETE" });
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      showToast("Playlist obrisana.");
    } catch (err) {
      showToast("Greška pri brisanju.", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nepoznato';
    return new Date(dateStr).toLocaleDateString("hr-HR", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";
  };

  return (
    <div className="profile">
      {toast && (
        <div className={`profile__toast profile__toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Hero */}
      <div className="profile__hero">
        <div className="profile__hero-bg" />
        <div className="profile__hero-content">
          {/* Avatar */}
          <div className="profile__avatar-wrapper">
            {editMode ? (
              <label className="profile__avatar-edit-label">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="profile__avatar-img" />
                ) : (
                  <div className="profile__avatar-initials">{getInitials(editName)}</div>
                )}
                <div className="profile__avatar-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </label>
            ) : (
              avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="profile__avatar-img" />
              ) : (
                <div className="profile__avatar-initials">{getInitials(user.name)}</div>
              )
            )}
          </div>

          {/* Info */}
          <div className="profile__info">
            {editMode ? (
              <input
                className="profile__name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tvoje ime"
              />
            ) : (
              <h1 className="profile__name">{user.name}</h1>
            )}
            <p className="profile__email">{user.email}</p>
            <p className="profile__joined">Član od {formatDate(user.createdAt)}</p>

            <div className="profile__stats">
              <div className="profile__stat">
                <span className="profile__stat-number">{songs.length}</span>
                <span className="profile__stat-label">Pjesama</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-number">{playlists.length}</span>
                <span className="profile__stat-label">Playlisti</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-number">{favorites.length}</span>
                <span className="profile__stat-label">Omiljenih</span>
              </div>
            </div>
          </div>

          {/* Edit buttons */}
          <div className="profile__actions">
            {editMode ? (
              <>
                <button className="profile__btn profile__btn--primary" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Sprema..." : "Spremi"}
                </button>
                <button className="profile__btn profile__btn--ghost" onClick={() => setEditMode(false)}>
                  Odustani
                </button>
              </>
            ) : (
              <button className="profile__btn profile__btn--ghost" onClick={() => setEditMode(true)}>
                ✎ Uredi profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`profile__tab ${activeTab === tab ? "profile__tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="profile__content">
        {loading ? (
          <div className="profile__loading">
            <div className="profile__spinner" />
            <p>Učitavanje...</p>
          </div>
        ) : (
          <>
            {/* Moje pjesme */}
            {activeTab === "Moje pjesme" && (
              <div>
                {songs.length > 0 ? (
                  <div className="profile__songs-grid">
                    {songs.map((song) => (
                      <SongCard key={song.id} song={song} />
                    ))}
                  </div>
                ) : (
                  <div className="profile__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                    </svg>
                    <p>Još nisi uploadovao/la nijednu pjesmu.</p>
                  </div>
                )}
              </div>
            )}

            {/* Playliste */}
            {activeTab === "Playliste" && (
              <div>
                <div className="profile__section-header">
                  <h2 className="profile__section-title">Moje playliste</h2>
                  <button className="profile__btn profile__btn--primary" onClick={() => setShowPlaylistModal(true)}>
                    + Nova playlist
                  </button>
                </div>
                {playlists.length > 0 ? (
                  <div className="profile__playlists">
                    {playlists.map((pl) => (
                      <div key={pl.id} className="profile__playlist-card">
                        <div className="profile__playlist-icon">🎵</div>
                        <div className="profile__playlist-info">
                          <h3 className="profile__playlist-name">{pl.name}</h3>
                          {pl.description && <p className="profile__playlist-desc">{pl.description}</p>}
                          <span className="profile__playlist-meta">{pl.songs?.length || 0} pjesama · {formatDate(pl.createdAt)}</span>
                        </div>
                        <button
                          className="profile__playlist-delete"
                          onClick={() => handleDeletePlaylist(pl.id)}
                          title="Obriši playlist"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <p>Nemaš još nijednu playlistu.</p>
                  </div>
                )}
              </div>
            )}

            {/* Omiljeno */}
            {activeTab === "Omiljeno" && (
              <div>
                <h2 className="profile__section-title">Omiljene pjesme & albumi</h2>
                {favorites.length > 0 ? (
                  <div className="profile__favorites">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="profile__fav-card">
                        <div className="profile__fav-cover">♪</div>
                        <div className="profile__fav-info">
                          <h3 className="profile__fav-title">{fav.title}</h3>
                          <p className="profile__fav-artist">{fav.artist}</p>
                          {fav.description && (
                            <p className="profile__fav-desc">"{fav.description}"</p>
                          )}
                        </div>
                        <span className="profile__fav-type">{fav.type === "album" ? "Album" : "Pjesma"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
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

      {/* Playlist modal */}
      {showPlaylistModal && (
        <div className="profile__modal-overlay" onClick={() => setShowPlaylistModal(false)}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile__modal-title">Nova playlist</h2>
            <div className="profile__modal-field">
              <label className="profile__modal-label">Naziv *</label>
              <input
                className="profile__modal-input"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="npr. Jutarnje vibracije"
              />
            </div>
            <div className="profile__modal-field">
              <label className="profile__modal-label">Opis (opcionalno)</label>
              <textarea
                className="profile__modal-textarea"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Kratki opis playliste..."
                rows={3}
              />
            </div>
            <div className="profile__modal-btns">
              <button className="profile__btn profile__btn--ghost" onClick={() => setShowPlaylistModal(false)}>
                Odustani
              </button>
              <button className="profile__btn profile__btn--primary" onClick={handleCreatePlaylist}>
                Kreiraj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
