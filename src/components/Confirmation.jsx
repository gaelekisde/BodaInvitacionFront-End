import { useState } from "react";
import "../styles/ConfirmationStyle.css";
import apiUtils from "../utils/apiUtils";

const Confirmation = () => {
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRSVP = async () => {
    setIsLoading(true);
    setConfirmationMessage("");
    
    const result = await apiUtils.actualizarEstado("Confirmado");
    
    if (result.success) {
      setConfirmationMessage("¡Asistencia confirmada exitosamente!");
    } else {
      if (result.error === "Sesión expirada") {
        setConfirmationMessage("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else {
        setConfirmationMessage("Error al confirmar asistencia. Intenta nuevamente.");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="confirmation-card">
          <div className="card-text">
            <p className="confirmation-message">
              Confirma tu asistencia antes del 1 de febrero nos hace mucha ilusión que nos acompañes en este día tan especial!
            </p>
            
            {confirmationMessage && (
              <div className={`message ${confirmationMessage.includes('exitosamente') ? 'success' : 'error'}`}>
                {confirmationMessage}
              </div>
            )}
            
            <button 
              className="rsvp-button"
              onClick={handleRSVP}
              disabled={isLoading}
            >
              {isLoading ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;