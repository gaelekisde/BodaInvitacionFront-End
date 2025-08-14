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
    // También limpiar el token almacenado
    clearStoredToken();
};

// Helper para detectar iOS
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Helper para manejar el token en localStorage como fallback para iOS
const getStoredToken = () => {
    try {
        return localStorage.getItem('authToken');
    } catch {
        return null;
    }
};

const setStoredToken = (token) => {
    try {
        localStorage.setItem('authToken', token);
    } catch {
        // Si falla localStorage, no hacer nada
    }
};

const clearStoredToken = () => {
    try {
        localStorage.removeItem('authToken');
    } catch {
        // Si falla localStorage, no hacer nada
    }
};

const getAuthHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cache-Control": "no-cache"
    };
    
    // Para iOS, agregar el token en el header Authorization como fallback
    const token = getStoredToken();
    if (token && isIOS()) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
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
            console.log('Login response data:', data);
        }

        // Para iOS, guardar el token en localStorage como fallback
        if (isIOS()) {
            // Primero intentar obtener el token de la respuesta JSON
            if (data.token) {
                setStoredToken(data.token);
                console.log('Token from response stored for iOS fallback');
            } else {
                // Si no está en la respuesta, intentar extraerlo de las cookies
                const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                    const [name, value] = cookie.trim().split('=');
                    acc[name] = value;
                    return acc;
                }, {});
                
                if (cookies.token) {
                    setStoredToken(cookies.token);
                    console.log('Token from cookies stored for iOS fallback');
                }
            }
        }

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
            // Debug: verificar cookies y headers disponibles
            const isDevelopment = import.meta.env.MODE === 'development';
            const headers = getAuthHeaders();
            
            if (isDevelopment) {
                console.log('Cookies available:', document.cookie);
                console.log('Stored token:', getStoredToken());
                console.log('Headers to send:', headers);
                console.log('Making request to:', `${urlApi()}families/me`);
            }

            const response = await fetch(`${urlApi()}families/me`, {
                method: "GET",
                credentials: "include",
                mode: 'cors',
                headers: headers
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