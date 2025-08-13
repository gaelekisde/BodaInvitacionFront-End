import { useState, useEffect } from "react";
import "../styles/SendMessageStyle.css";
import apiUtils from "../utils/apiUtils";

const SendMessage = () => {
  const [apellido, setApellido] = useState("...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarApellido = async () => {
      const result = await apiUtils.getFamilia();
      setApellido(result.apellido);
    };
    
    cargarApellido();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevoMensaje = formData.get("message");

    if (!nuevoMensaje || nuevoMensaje.trim() === "") {
      alert("Por favor escribe un mensaje antes de enviar");
      return;
    }

    setLoading(true);
    
    try {
      const result = await apiUtils.SendMessage(nuevoMensaje);
      if (result.success) {
        alert("¡Mensaje enviado con éxito!");
        e.target.reset(); // Limpiar el formulario
      } else {
        alert("Error al enviar mensaje: " + (result.error || "Error desconocido"));
      }
    } catch (error) {
      alert("Error al enviar mensaje: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-message-container">
      <div className="send-message-content">
        <h2 className="send-message-title">Envía un mensaje</h2>
        <p className="send-message-subtitle">Comparte tus buenos deseos con los novios</p>
        
        <form className="message-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">De parte de:</label>
            <input 
              type="text" 
              id="name"
              readOnly
              className="form-input" 
              value={`Familia ${apellido}`}
              placeholder="Familia"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="form-label">Tu mensaje</label>
            <textarea 
              id="message"
              name="message"
              className="form-textarea" 
              rows="4"
              placeholder="Escribe aquí tus buenos deseos para Omar y Karely..."
              required
            ></textarea>
          </div>
          
          <button type="submit" className="send-button" disabled={loading}>
            <span className="button-text">
              {loading ? "Enviando..." : "Enviar mensaje"}
            </span>
            <span className="button-icon">💌</span>
          </button>
        </form>
        
        <p className="send-message-note">
          Tu mensaje será enviado directamente a los novios
        </p>
      </div>
    </div>
  );
};

export default SendMessage;