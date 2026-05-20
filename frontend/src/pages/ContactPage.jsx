import { useState } from "react";
import "./ContactPage.css";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Molimo popunite sva obavezna polja.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="contact">
      <div className="contact__header">
        <h1 className="contact__title">
          Kontaktiraj <span className="contact__title-accent">nas</span>
        </h1>
        <p className="contact__subtitle">Tu smo za sve tvoje prijedloge, pitanja i povratne informacije</p>
      </div>

      <div className="contact__content">
        {/* Info cards */}
        <div className="contact__info">
          <div className="contact__info-card">
            <div className="contact__info-icon">📧</div>
            <div>
              <h3 className="contact__info-label">Email</h3>
              <p className="contact__info-value">podrska@shnare.ba</p>
            </div>
          </div>
          <div className="contact__info-card">
            <div className="contact__info-icon">📍</div>
            <div>
              <h3 className="contact__info-label">Lokacija</h3>
              <p className="contact__info-value">Sarajevo, Bosna i Hercegovina</p>
            </div>
          </div>
          <div className="contact__info-card">
            <div className="contact__info-icon">🕐</div>
            <div>
              <h3 className="contact__info-label">Radno vrijeme</h3>
              <p className="contact__info-value">Pon–Pet, 9:00–17:00</p>
            </div>
          </div>

          {/* Google Maps embed */}
          <div className="contact__map">
            <iframe
              title="Lokacija - Sarajevo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11464.949999999!2d18.3890!3d43.8563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4758c9e13e0aeaad%3A0xd83c3d1fc46e6d14!2sSarajevo!5e0!3m2!1sbs!2sba!4v1234567890"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Form */}
        <div className="contact__form-card">
          {sent ? (
            <div className="contact__success">
              <div className="contact__success-icon">✓</div>
              <h2>Poruka poslana!</h2>
              <p>Hvala ti na poruci. Javit ćemo se uskoro.</p>
              <button
                className="contact__btn"
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              >
                Pošalji novu poruku
              </button>
            </div>
          ) : (
            <>
              <h2 className="contact__form-title">Pošalji poruku</h2>
              {error && <div className="contact__error">⚠️ {error}</div>}
              <form onSubmit={handleSubmit} className="contact__form">
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label className="contact__label">Ime i prezime *</label>
                    <input
                      className="contact__input"
                      type="text"
                      placeholder="Tvoje ime"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="contact__field">
                    <label className="contact__label">Email adresa *</label>
                    <input
                      className="contact__input"
                      type="email"
                      placeholder="tvoj@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="contact__field">
                  <label className="contact__label">Tema</label>
                  <input
                    className="contact__input"
                    type="text"
                    placeholder="O čemu se radi?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="contact__field">
                  <label className="contact__label">Poruka *</label>
                  <textarea
                    className="contact__input contact__textarea"
                    placeholder="Napiši svoju poruku ovdje..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                  />
                </div>
                <button type="submit" className="contact__btn">
                  Pošalji poruku →
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
