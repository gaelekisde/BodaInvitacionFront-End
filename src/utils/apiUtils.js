const urlApi = () => {
    // En producción, usar la URL absoluta del backend
    // En desarrollo, usar URL relativa para el proxy de Vite
    const isDevelopment = import.meta.env.MODE === 'development';
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Solo log en desarrollo para evitar spam en producción
    if (isDevelopment) {
        console.log('Environment:', { 
            mode: import.meta.env.MODE, 
            isDevelopment, 
            apiUrl,
            userAgent: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Other'
        });
    }
    
    if (!isDevelopment && apiUrl) {
        // Producción: usar URL absoluta del backend
        const finalUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
        if (isDevelopment) console.log('Using production API URL:', finalUrl);
        return finalUrl;
    } else if (!isDevelopment) {
        // Fallback para producción si no hay VITE_API_URL
        const fallbackUrl = "https://boda-invitacion-digital-fqxy.vercel.app/api/";
        if (isDevelopment) console.log('Using fallback API URL:', fallbackUrl);
        return fallbackUrl;
    }
    
    // Desarrollo: usar proxy relativo
    if (isDevelopment) console.log('Using development API URL: /api/');
    return "/api/";
};

const FAMILIA_TTL_MS = 2 * 60 * 1000;
let familiaCache = {
    apellido: null,
    expiry: 0,
    inflight: null,
};

const invalidateFamiliaCache = () => {
    familiaCache = { apellido: null, expiry: 0, inflight: null };
};

// Helper para detectar iOS
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Helper para delay en iOS después de login
const postLoginDelay = async () => {
    if (isIOS()) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay para iOS
    }
};

const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cache-Control": "no-cache"
    };
};

const login = async (codigo) => {
    try {
        const response = await fetch(`${urlApi()}auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                "CodigoFamilia": codigo
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

    const data = await response.json();

    // Invalida cache al cambiar de sesión
    invalidateFamiliaCache();

        // Debug: verificar si se establecieron cookies
        const isDevelopment = import.meta.env.MODE === 'development';
        if (isDevelopment) {
            console.log('Login response headers:', [...response.headers.entries()]);
            console.log('Cookies after login:', document.cookie);
            console.log('Is iOS:', isIOS());
        }

        // Pequeño delay para iOS para que las cookies se asienten
        await postLoginDelay();

        return {
            success: data.message === "Login exitoso",
            data: data
        };
    } catch (error) {
        console.error('Login error:', error);
        // En producción, solo retorna el error
        return {
            success: false,
            error: "Error de conexión. Intenta nuevamente."
        };
    }
};


const getFamilia = async () => {
    const now = Date.now();

    // 1️⃣ Respuesta desde cache si no está expirada
    if (familiaCache.apellido && now < familiaCache.expiry) {
        return { success: true, apellido: familiaCache.apellido };
    }

    // 2️⃣ Si hay petición en curso, esperar el mismo Promise
    if (familiaCache.inflight) {
        return await familiaCache.inflight;
    }

    // 3️⃣ Crear nueva petición
    familiaCache.inflight = (async () => {
        try {
            // Debug: verificar cookies disponibles
            const isDevelopment = import.meta.env.MODE === 'development';
            if (isDevelopment) {
                console.log('Cookies available:', document.cookie);
                console.log('Making request to:', `${urlApi()}families/me`);
            }

            const response = await fetch(`${urlApi()}families/me`, {
                method: "GET",
                credentials: "include",
                mode: 'cors',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                console.error(`families/me error: ${response.status}`);
                console.error('Response headers:', [...response.headers.entries()]);
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            const apellido = data.Apellido || "familia";

            // Actualizar cache con TTL
            familiaCache.apellido = apellido;
            familiaCache.expiry = Date.now() + FAMILIA_TTL_MS;

            return { success: true, apellido };
        } catch {
            return { success: false, apellido: "familia" };
        } finally {
            // Siempre limpiar inflight
            familiaCache.inflight = null;
        }
    })();

    // 4️⃣ Devolver resultado
    return await familiaCache.inflight;
};


const actualizarEstado = async (estado = "Confirmado") => {
    try {
        const response = await fetch(`${urlApi()}families/actualizar-estado`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                "estado": estado
            })
        });
        
        if (!response.ok) {
            console.error(`actualizar-estado error: ${response.status}`);
            if (response.status === 401) {
                throw new Error("Sesión expirada");
            }
            throw new Error("Error en la petición");
        }
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('actualizarEstado error:', error);
        // En producción, solo retorna el error
        return {
            success: false,
            error: error.message
        };
    }
};

const SendMessage = async (nuevoMensaje) => {

    try {
        const response = await fetch(`${urlApi()}families/mensaje`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                "nuevoMensaje": nuevoMensaje
            })
        });

        if (!response.ok) {
            console.error(`send-message error: ${response.status}`);
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('SendMessage error:', error);
        // En producción, solo retorna el error
        return {
            success: false,
            error: error.message
        };
    }
}
const apiUtils = {
    urlApi,
    getAuthHeaders,
    login,
    getFamilia,
    actualizarEstado,
    SendMessage,
    invalidateFamiliaCache
};

export default apiUtils;
//TO DO
//TItulos color negro
//colores claritos
//