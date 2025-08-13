import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiUtils from "../utils/apiUtils";

// Componente para proteger rutas: renderiza de inmediato y redirige si el check falla
function ProtectedRoute({ children }) {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiUtils.getFamilia();
        if (!mounted) return;
        if (!res.success) setRedirect(true);
      } catch {
        if (!mounted) return;
        setRedirect(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (redirect) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
