import "../styles/UbicationStyle.css";

const Ubication = () => {
  const handleLocationClick = () => {
    // Abrir Google Maps con la ubicación
    window.open("https://maps.app.goo.gl/cwq1hDikW2t6bDSn8", "_blank");
  };

  return (
    <div className="ubication-container">
      <div className="ubication-content">
        <div className="ubication-card">
          <div className="card-text">
            <p className="ubication-message">
              Aquí encontrarás la ubicación para que no te pierdas nada
            </p>
            <button 
              className="location-button"
              onClick={handleLocationClick}
            >
              Aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ubication;