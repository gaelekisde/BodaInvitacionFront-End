import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiUtils from "../utils/apiUtils";

// Componente para proteger rutas con mejor manejo para iOS
function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState('checking'); // 'checking', 'authenticated', 'unauthenticated'

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const checkAuth = async () => {
      try {
        // Esperar un poco más en iOS para que las cookies se establezcan
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        const res = await apiUtils.getFamilia();
        if (!mounted) return;
        
        // Verificar que tenemos un apellido válido (no genérico)
        if (res.success && res.apellido && res.apellido.trim() && res.apellido !== "familia") {
          setAuthState('authenticated');
        } else {
          // Intentar una vez más después de un breve delay
          timeoutId = setTimeout(async () => {
            if (!mounted) return;
            const retryRes = await apiUtils.getFamilia();
            if (!mounted) return;
            
            if (retryRes.success && retryRes.apellido && retryRes.apellido.trim() && retryRes.apellido !== "familia") {
              setAuthState('authenticated');
            } else {
              setAuthState('unauthenticated');
            }
          }, 500);
        }
      } catch {
        if (!mounted) return;
        // Reintentar una vez en caso de error de red
        timeoutId = setTimeout(() => {
          if (!mounted) return;
          setAuthState('unauthenticated');
        }, 1000);
      }
    };

    checkAuth();

    return () => { 
      mounted = false; 
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Mostrar loading mientras verifica
  if (authState === 'checking') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--primary-pink, #f4e6e6)'
      }}>
        <div style={{
          color: 'var(--dark-text, #2c2c2c)',
          fontSize: '1.2rem',
          fontFamily: "'Playfair Display', serif"
        }}>
          Verificando acceso...
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
