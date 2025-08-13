import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BlockStyle.css";
import apiUtils from "../utils/apiUtils";

function BlockScreen() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCode(value);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await apiUtils.login(code);

        if (result.success && result.data.message === "Login exitoso") {
            // La cookie httpOnly no es visible en document.cookie; el navegador la enviará automáticamente.
            navigate("/main");
        } else {
            setError(result.error || "Código inválido. Intenta nuevamente.");
            setCode("");
        }
        
        setIsLoading(false);
    };

    return (
        <div className="block-container">
            <div className="desktop-message">
                <h1>¡Por favor, usa tu teléfono!</h1>
                <p>Esta experiencia está diseñada específicamente para dispositivos móviles.</p>
                <p>Abre este enlace en tu celular para continuar.</p>
            </div>
            
            <div className="mobile-content">
                <div className="welcome-card">
                    <h2 className="title">¡Queremos que seas parte de nuestro día especial!</h2>
                    <p className="subtitle">Por favor, ingresa tu código de acceso único para continuar:</p>
                    
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className={`code-input ${error ? 'error' : ''}`}
                            placeholder="Ingresa tu código"
                            value={code}
                            onChange={handleCodeChange}
                            maxLength="6"
                            disabled={isLoading}
                        />
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button 
                            type="submit" 
                            className="enter-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verificando..." : "Ingresar"}
                        </button>
                    </form>
                    
                    <div className="valid-codes-hint">
                        <p>💡 Códigos de prueba: BODA24, GAEL01, JARED01, INVITE, 123456</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlockScreen;