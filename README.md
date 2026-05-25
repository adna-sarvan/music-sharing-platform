# music-sharing-platform

Projektni zadatak iz predmeta **Dizajn web stranica (DWS)** i **Operativni sistemi i računarstvo u oblaku (OSiRuO)** – Softversko inženjerstvo 2025/2026.

Platforma za dijeljenje i istraživanje muzike. Korisnici mogu pregledavati pjesme, uploadovati svoje, a administratori upravljati svim sadržajem.

---

## Tim

| GitHub | DWS doprinos | OSiRuO doprinos |
|--------|-------------|-----------------|
| [@hanajasarevic](https://github.com/hana-jasarevic) | Landing page, navigacija, registracija/prijava, Context API, `useAuth` custom hook, protected routes | Dockerfile za frontend (multi-stage, nginx) |
| [@adnasarvan](https://github.com/adna-sarvan) | Browse/pretraga muzike, upload forma, korisnički profil, 404 stranica, responsivan dizajn, animacije | Dockerfile za backend (json-server), docker-compose.yml, GitHub Actions |
| [@peratoviclamija](https://github.com/peratoviclamija) | Admin panel (CRUD), kontakt stranica + Google Maps, json-server setup, `useFetch` custom hook | GCP setup, Cloud Run deployment, health-check.sh skripta, README dokumentacija |

---

## Tech Stack

| Tehnologija | Verzija |
|-------------|---------|
| React | 18.x |
| React Router | 6.x |
| Tailwind CSS | 3.x |
| json-server | 0.17.x |
| Docker | latest |
| Google Cloud Run | - |

---

## Pokretanje projekta

### Preduslovi
- Node.js 18+
- npm

### 1. Kloniranje repozitorijuma

```bash
git clone https://github.com/adna-sarvan/music-sharing-platform.git
cd music-sharing-platform
```

### 2. Pokretanje backenda (json-server)

```bash
cd backend
npm install
npm start
```

Backend je dostupan na: `http://localhost:3001`

### 3. Pokretanje frontenda

```bash
cd frontend
npm install
npm run dev
```

Frontend je dostupan na: `http://localhost:5173`

---

## Stranice

| Ruta | Stranica | Opis |
|------|----------|------|
| `/` | Browse | Pregled i pretraga svih pjesama |
| `/upload` | Upload | Dodavanje nove pjesme |
| `/admin` | Admin Panel | CRUD upravljanje pjesmama |
| `/contact` | Kontakt | Kontakt forma i Google Maps |

---

## API Endpoints

| Metod | Endpoint | Opis |
|-------|----------|------|
| GET | `/songs` | Dohvati sve pjesme |
| GET | `/songs/:id` | Dohvati jednu pjesmu |
| POST | `/songs` | Dodaj novu pjesmu |
| PUT | `/songs/:id` | Ažuriraj pjesmu |
| DELETE | `/songs/:id` | Obriši pjesmu |

---

## Health Check

```bash
bash health-check.sh
```

Skripta provjerava da li su frontend i backend servisi dostupni.

---

## Deployment

Aplikacija je deployovana na **Google Cloud Run**.

- Frontend: Docker container sa nginx serverom
- Backend: Docker container sa json-serverom
- Orkestracija: docker-compose.yml
- CI/CD: GitHub Actions
