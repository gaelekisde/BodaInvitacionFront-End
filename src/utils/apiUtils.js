// apiUtils optimizado — más rápido y más limpio

const IS_DEV = import.meta.env.MODE === 'development';
const RAW_API_URL = import.meta.env.VITE_API_URL || "";
// En dev siempre usamos proxy relativo "/api/"
// En prod usamos VITE_API_URL (si existe) o fallback
const BASE_API_URL = (IS_DEV ? "/api/" : (RAW_API_URL ? (RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`) : "https://boda-invitacion-digital-fqxy.vercel.app/api/"));

// Dev logs helper (no logs en producción)
const dlog = (...args) => { if (IS_DEV) console.log(...args); };

// Reusar headers (objeto inmutable)
const DEFAULT_HEADERS = Object.freeze({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Cache-Control": "no-cache"
});

// Small helper to safely access localStorage (returns null on error)
const safeLocalStorage = {
    set(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { console.error('localStorage.set error', e); }
    },
    get(key) {
        try { return localStorage.getItem(key); } catch (e) { console.error('localStorage.get error', e); return null; }
    },
    remove(key) {
        try { localStorage.removeItem(key); } catch (e) { console.error('localStorage.remove error', e); }
    }
};

// Exported small helpers for codigoFamilia
const setCodigoFamilia = (codigoFamilia) => safeLocalStorage.set('codigoFamilia', codigoFamilia);
const getCodigoFamilia = () => safeLocalStorage.get('codigoFamilia');
const clearCodigoFamilia = () => safeLocalStorage.remove('codigoFamilia');

// Normalizar construcción de URL base + ruta sin introducir // dobles
const buildUrl = (path = "") => {
    const trimmedBase = BASE_API_URL.endsWith('/') ? BASE_API_URL : `${BASE_API_URL}/`;
    const trimmedPath = `${path || ""}`.replace(/^\/+/, '');
    return `${trimmedBase}${trimmedPath}`;
};

// Wrapper genérico para fetch que devuelve { success, data?, error? }
const request = async (method, path, body = undefined) => {
    const url = buildUrl(path);
    const opts = {
        method,
        headers: DEFAULT_HEADERS,
        // mode defaults are usually sufficient; solo poner si hay problemas CORS en prod
        // mode: 'cors'
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    dlog('request', { method, url, body });

    try {
        const res = await fetch(url, opts);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            // Intenta parsear JSON si viene, si no muestra text
            let parsed;
            try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
            const errMsg = parsed && parsed.message ? parsed.message : `HTTP ${res.status}`;
            return { success: false, error: errMsg, status: res.status, raw: parsed };
        }
        // Intentamos parsear JSON — en APIs habituales este es el caso
        const data = await res.json().catch(() => null);
        return { success: true, data };
    } catch (error) {
        console.error('request error', error);
        return { success: false, error: error.message || 'Network error' };
    }
};

// Mantener compatibilidad con nombre urlApi (devuelve la base)
const urlApi = () => BASE_API_URL;

// API functions

const login = async (codigo) => {
    const payload = { CodigoFamilia: codigo };
    const result = await request("POST", "auth/login", payload);
    if (result.success && result.data) {
        dlog('Login response data:', result.data);
        if (result.data.message === "Login exitoso" && result.data.codigoFamilia) {
            setCodigoFamilia(result.data.codigoFamilia);
        }
        return { success: result.data.message === "Login exitoso", data: result.data };
    }
    return { success: false, error: result.error || 'Error de conexión. Intenta nuevamente.' };
};

const getFamilia = async (codigoFamiliaParam) => {
    const codigo = codigoFamiliaParam || getCodigoFamilia();
    if (!codigo) return { success: false, apellido: "familia", error: "No codigoFamilia" };

    dlog('getFamilia - request to', `families/${codigo}`);
    const result = await request("GET", `families/${codigo}`);
    if (!result.success) return { success: false, apellido: "familia", error: result.error };

    const apellido = result.data?.Apellido || "familia";
    return { success: true, apellido, data: result.data };
};

const actualizarEstado = async (codigoFamiliaOrEstado, estadoParam) => {
    // Soporta las mismas firmas: actualizarEstado("Confirmado") | actualizarEstado("COD", "Confirmado") | actualizarEstado(null, "Confirmado")
    let codigo, estado;
    if (typeof codigoFamiliaOrEstado === 'string' && !estadoParam) {
        estado = codigoFamiliaOrEstado;
        codigo = getCodigoFamilia();
    } else {
        codigo = codigoFamiliaOrEstado || getCodigoFamilia();
        estado = estadoParam || "Confirmado";
    }
    if (!codigo) return { success: false, error: "No se encontró el código de familia" };

    dlog('actualizarEstado', { codigo, estado });
    const result = await request("PATCH", `families/${codigo}/actualizar-estado`, { estado });
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
};

const SendMessage = async (codigoFamiliaOrMensaje, mensajeParam) => {
    // Soporta SendMessage(message) o SendMessage(codigo, message) o SendMessage(null, message)
    let codigo, mensaje;
    if (typeof codigoFamiliaOrMensaje === 'string' && mensajeParam === undefined) {
        mensaje = codigoFamiliaOrMensaje;
        codigo = getCodigoFamilia();
    } else {
        codigo = codigoFamiliaOrMensaje || getCodigoFamilia();
        mensaje = mensajeParam;
    }
    if (!codigo) return { success: false, error: "No se encontró el código de familia" };
    if (mensaje === undefined || mensaje === null) return { success: false, error: "Mensaje vacío" };

    const result = await request("PATCH", `families/${codigo}/mensaje`, { nuevoMensaje: mensaje });
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
};

const getAllFamilies = async () => {
    const result = await request("GET", "families");
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
};

const createFamily = async (familyData) => {
    const result = await request("POST", "families", familyData);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
};

const deleteFamily = async (id) => {
    if (!id) return { success: false, error: "ID requerido" };
    const result = await request("DELETE", `families/${id}`);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
};

const logout = () => { clearCodigoFamilia(); dlog('logout - codigoFamilia cleared'); };

const apiUtils = {
    urlApi,
    getHeaders: () => DEFAULT_HEADERS,
    login,
    logout,
    getFamilia,
    actualizarEstado,
    SendMessage,
    getAllFamilies,
    createFamily,
    deleteFamily,
    setCodigoFamilia,
    getCodigoFamilia,
    clearCodigoFamilia
};

export default apiUtils;
