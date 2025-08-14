const urlApi = () => {
    // Usa una URL relativa en desarrollo para pasar por el proxy de Vite (/api -> http://localhost:3000)
    // y una URL absoluta en producción si VITE_API_URL está definida.
    const base = import.meta?.env?.VITE_API_URL;
    if (base) {
        return base.endsWith('/') ? base : `${base}/`;
    }
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

const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json"
    };
};

const login = async (codigo) => {
    try {
        const response = await fetch(`${urlApi()}auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                "CodigoFamilia": codigo
            })
        });

    const data = await response.json();

    // Invalida cache al cambiar de sesión
    invalidateFamiliaCache();

        return {
            success: data.message === "Login exitoso",
            data: data
        };
    } catch {
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
            const response = await fetch(`${urlApi()}families/me`, {
                method: "GET",
                credentials: "include",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
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
            body: JSON.stringify({
                "estado": estado
            })
        });
        
        if (!response.ok) {
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
            body: JSON.stringify({
                "nuevoMensaje": nuevoMensaje
            })
        });

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
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