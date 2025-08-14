const urlApi = () => {
    //return "http://localhost:3000/api/";
    return import.meta.env.VITE_API_URL || "https://boda-invitacion-digital-fqxy.vercel.app/api/";
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
    // Con cookies httpOnly no podemos leer el token en el cliente.l token en el cliente.
    // El servidor autentica por cookie; solo enviamos credentials: 'include'.
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

        if (data.message === "Login exitoso") {
            // En iOS, esperar un poco para que las cookies se establezcan
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Verificar que la sesión esté realmente establecida
            const verifyRes = await getFamilia();
            if (verifyRes.success && verifyRes.apellido && verifyRes.apellido.trim() && verifyRes.apellido !== "familia") {
                return {
                    success: true,
                    data: data
                };
            } else {
                // Si la verificación falla, esperar un poco más y reintentar
                await new Promise(resolve => setTimeout(resolve, 300));
                const retryRes = await getFamilia();
                return {
                    success: retryRes.success && retryRes.apellido && retryRes.apellido.trim() && retryRes.apellido !== "familia",
                    data: data
                };
            }
        }

        return {
            success: false,
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
    try {
        const now = Date.now();
        // Devuelve de cache si está fresco
        if (familiaCache.apellido && now < familiaCache.expiry) {
            return { success: true, apellido: familiaCache.apellido };
        }

        // De-dup: si ya hay una petición en curso, reúsala
        if (familiaCache.inflight) {
            return await familiaCache.inflight;
        }

        // Nueva petición y guárdala como inflight
        familiaCache.inflight = (async () => {
            const response = await fetch(`${urlApi()}families/me`, {
                method: "GET",
                credentials: "include",
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                // En iOS, a veces el primer intento falla, intentar una vez más
                if (response.status === 401) {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    if (isIOS) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        const retryResponse = await fetch(`${urlApi()}families/me`, {
                            method: "GET",
                            credentials: "include",
                            headers: getAuthHeaders()
                        });
                        if (!retryResponse.ok) {
                            throw new Error(`Error: ${retryResponse.status}`);
                        }
                        // El endpoint devuelve directamente el apellido como string, ej: "Cruz"
                        const retryData = await retryResponse.json();
                        const apellido = retryData && retryData.trim() ? retryData.trim() : "familia";
                        familiaCache.apellido = apellido;
                        familiaCache.expiry = Date.now() + FAMILIA_TTL_MS;
                        return { success: true, apellido };
                    }
                }
                throw new Error(`Error: ${response.status}`);
            }
            
            // El endpoint devuelve directamente el apellido como string, ej: "Cruz"
            const data = await response.json();
            const apellido = data && data.trim ? data.trim() : (data || "familia");
            // Actualiza cache con TTL
            familiaCache.apellido = apellido;
            familiaCache.expiry = Date.now() + FAMILIA_TTL_MS;
            return { success: true, apellido };
        })();

        const result = await familiaCache.inflight;
        return result;
    } catch {
        // En producción, solo retorna el error
        return {
            success: false,
            apellido: "familia"
        };
    } finally {
        // Limpia el inflight para permitir reintentos posteriores
        familiaCache.inflight = null;
    }
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