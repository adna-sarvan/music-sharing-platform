import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <div className="notfound__bg" />

      <div className="notfound__content">
        <div className="notfound__visual">
          <div className="notfound__number">
            <span>4</span>
            <div className="notfound__vinyl">
              <div className="notfound__vinyl-inner">
                <div className="notfound__vinyl-center" />
              </div>
            </div>
            <span>4</span>
          </div>
        </div>

        <h1 className="notfound__title">Ova stranica ne postoji</h1>
        <p className="notfound__subtitle">
          Izgubio/la si se u ritmu. Pjesma koju tražiš nije ovdje – možda je uklonjena ili nikad nije ni postojala.
        </p>

        <div className="notfound__actions">
          <button className="notfound__btn notfound__btn--primary" onClick={() => navigate("/")}>
            Idi na početnu
          </button>
          <button className="notfound__btn notfound__btn--ghost" onClick={() => navigate(-1)}>
            ← Nazad
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
