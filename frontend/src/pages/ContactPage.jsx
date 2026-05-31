import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./ContactPage.css";
import API from "../config";

const validate = (f) => {
  const e = {};
  if (!f.name.trim())   e.name    = "Ime je obavezno.";
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Unesite ispravnu email adresu.";
  if (!f.subject.trim()) e.subject = "Tema je obavezna.";
  if (!f.message.trim() || f.message.trim().length < 10) e.message = "Poruka mora imati najmanje 10 karaktera.";
  return e;
};

const ContactPage = () => {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false); // Stanje za učitavanje tokom slanja u Supabase

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Klijentska validacija forme
    const e2 = validate(form);
    if (Object.keys(e2).length) { 
      setErrors(e2); 
      return; 
    }
    
    setSending(true);

    try {
      // 2. Slanje podataka u Supabase tabelu 'messages'
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim()
          }
        ]);

      if (error) throw error;

      // Ako je sve prošlo u redu, prikazujemo success ekran
      setSent(true);
    } catch (err) {
      console.error("Greška pri slanju u Supabase:", err);
      // Opcionalno: možeš postaviti neku globalnu grešku ako slanje fejsa
      alert("Došlo je do greške prilikom slanja poruke. Pokušajte ponovo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact__orb contact__orb--1" />
      <div className="contact__orb contact__orb--2" />

      <div className="contact__inner">
        <div className="contact__header">
          <p className="shn-section-label">Kontakt</p>
          <h1 className="contact__title">Kontaktiraj <span className="shn-grad-text">nas</span></h1>
          <p className="contact__sub">Tu smo za sve tvoje prijedloge, pitanja i povratne informacije.</p>
        </div>

        <div className="contact__grid">
          {/* Info + Map */}
          <div className="contact__left">
            {[
              { icon: "📧", label: "Email",        val: "podrska@shnare.ba" },
              { icon: "📍", label: "Lokacija",     val: "Sarajevo, Bosna i Hercegovina" },
              { icon: "🕐", label: "Radno vrijeme", val: "Pon–Pet, 9:00–17:00" },
            ].map(({ icon, label, val }) => (
              <div key={label} className="contact__info-card">
                <div className="contact__info-icon">{icon}</div>
                <div>
                  <p className="contact__info-label">{label}</p>
                  <p className="contact__info-val">{val}</p>
                </div>
              </div>
            ))}
            <div className="contact__map">
              <iframe
                title="Sarajevo"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11464.95!2d18.389!3d43.8563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4758c9e13e0aeaad%3A0xd83c3d1fc46e6d14!2sSarajevo!5e0!3m2!1sbs!2sba!4v1"
                width="100%" height="220" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="contact__form-card shn-card">
            {sent ? (
              <div className="contact__success">
                <div className="contact__success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="34" height="34">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="contact__success-title">Poruka poslana!</h2>
                <p className="contact__success-sub">Hvala na poruci. Javit ćemo se uskoro.</p>
                <button className="shn-btn shn-btn-primary" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  Pošalji novu poruku
                </button>
              </div>
            ) : (
              <>
                <h2 className="contact__form-title">Pošalji poruku</h2>
                <form onSubmit={handleSubmit} noValidate className="contact__form">
                  <div className="contact__row">
                    <div className="contact__field">
                      <label className="upload__label">Ime i prezime *</label>
                      <input className={`shn-input ${errors.name ? "shn-input--err" : ""}`} name="name" value={form.name} onChange={handleChange} placeholder="Tvoje ime" />
                      {errors.name && <p className="upload__field-error">{errors.name}</p>}
                    </div>
                    <div className="contact__field">
                      <label className="upload__label">Email *</label>
                      <input className={`shn-input ${errors.email ? "shn-input--err" : ""}`} name="email" type="email" value={form.email} onChange={handleChange} placeholder="tvoj@email.com" />
                      {errors.email && <p className="upload__field-error">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="contact__field">
                    <label className="upload__label">Tema *</label>
                    <input className={`shn-input ${errors.subject ? "shn-input--err" : ""}`} name="subject" value={form.subject} onChange={handleChange} placeholder="O čemu se radi?" />
                    {errors.subject && <p className="upload__field-error">{errors.subject}</p>}
                  </div>
                  <div className="contact__field">
                    <label className="upload__label">Poruka *</label>
                    <textarea className={`shn-input shn-textarea ${errors.message ? "shn-input--err" : ""}`} name="message" value={form.message} onChange={handleChange} placeholder="Napiši svoju poruku ovdje..." rows={5} />
                    {errors.message && <p className="upload__field-error">{errors.message}</p>}
                  </div>
                  <button type="submit" className="shn-btn shn-btn-primary contact__submit" disabled={sending}>
                    {sending ? "Slanje..." : "Pošalji poruku"}
                    {!sending && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;