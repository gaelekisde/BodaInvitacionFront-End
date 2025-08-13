import "../styles/ConfirmationStyle.css";
import apiUtils from "../utils/apiUtils";

const Confirmation = () => {
  const handleRSVP = async () => {
    const result = await apiUtils.actualizarEstado("Confirmado");
    
    if (result.success) {
      console.log("RSVP actualizado:", result.data);
      alert("¡Asistencia confirmada exitosamente!");
    } else {
      console.error("Error al actualizar RSVP:", result.error);
      if (result.error === "Sesión expirada") {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else {
        alert("Error al confirmar asistencia. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="confirmation-card">
          <div className="card-text">
            <p className="confirmation-message">
              Confirma tu asistencia antes del 1 de febrero nos hace mucha ilusión que nos acompañes en este día tan especial!
            </p>
            <button 
              className="rsvp-button"
              onClick={handleRSVP}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;