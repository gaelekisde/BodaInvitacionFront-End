import "../styles/InvitationStyle.css";

const Invitation = () => {
  return (
    <div className="invitation-container">
      <div className="invitation-content">
        {/* Nombres de los novios */}
        <div className="couple-names">
          <h1 className="groom-name">Karely Hernandez</h1>
          <div className="ampersand">&</div>
          <h1 className="bride-name">Omar Chaparro</h1>
        </div>
        
        {/* Mensaje principal */}
        <div className="main-message">
          <p className="invitation-text">
            JUNTO A SUS FAMILIAS, TE INVITAN<br />
            A CELEBRAR SU MATRIMONIO.
          </p>
        </div>
        
        {/* Fecha */}
        <div className="date-section">
          <h2 className="date-text">28 de marzo</h2>
          <h2 className="year-text">2026</h2>
        </div>
        
        {/* Lugar y hora */}
        <div className="venue-section">
          <p className="venue-text">En algún lugar del mundo</p>
          <p className="time-text">4:00 pm</p>
        </div>
        
        {/* Mensaje final */}
        <div className="final-message">
          <p className="confirmation-text">
            Nos encantaría contar con tu presencia, por<br />
            favor confirma tu asistencia antes del 1 de<br />
            Enero.
          </p>
        </div>
        
        {/* Decoración floral */}
        <div className="floral-decoration">
          <div className="flower-accent"></div>
        </div>
      </div>
    </div>
  );
};

export default Invitation;