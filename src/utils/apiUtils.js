const urlApi = () => {
   //return "http://localhost:3000/api/";
   //activar esto en produccion:
   return "https://boda-invitacion-digital-fqxy.vercel.app/api/";
};

// Simple headers for API requests (no authentication needed)
const getHeaders = () => {
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cache-Control": "no-cache"
    };
};

// Helper functions for managing codigoFamilia in localStorage
const setCodigoFamilia = (codigoFamilia) => {
    try {
        localStorage.setItem('codigoFamilia', codigoFamilia);
    } catch (error) {
        console.error('Error saving codigoFamilia:', error);
    }
};

const getCodigoFamilia = () => {
    try {
        return localStorage.getItem('codigoFamilia');
    } catch (error) {
        console.error('Error retrieving codigoFamilia:', error);
        return null;
    }
};

const clearCodigoFamilia = () => {
    try {
        localStorage.removeItem('codigoFamilia');
    } catch (error) {
        console.error('Error clearing codigoFamilia:', error);
    }
};

const login = async (codigo) => {
    try {
        const response = await fetch(`${urlApi()}auth/login`, {
            method: "POST",
            headers: getHeaders(),
            mode: 'cors',
            body: JSON.stringify({
                "CodigoFamilia": codigo
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Debug en desarrollo
        const isDevelopment = import.meta.env.MODE === 'development';
        if (isDevelopment) {
            console.log('Login response data:', data);
        }

        // Store codigoFamilia if login is successful
        if (data.message === "Login exitoso" && data.codigoFamilia) {
            setCodigoFamilia(data.codigoFamilia);
        }

        return {
            success: data.message === "Login exitoso",
            data: data
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: "Error de conexión. Intenta nuevamente."
        };
    }
};


const getFamilia = async (codigoFamilia) => {
    try {
        // If no codigoFamilia provided, get it from localStorage
        const codigo = codigoFamilia || getCodigoFamilia();
        
        if (!codigo) {
            console.error('No codigoFamilia available');
            return { success: false, apellido: "familia" };
        }

        // Debug en desarrollo
        const isDevelopment = import.meta.env.MODE === 'development';
        
        if (isDevelopment) {
            console.log('Making request to:', `${urlApi()}families/${codigo}`);
        }

        const response = await fetch(`${urlApi()}families/${codigo}`, {
            method: "GET",
            mode: 'cors',
            headers: getHeaders()
        });

        if (!response.ok) {
            console.error(`families/${codigo} error: ${response.status}`);
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const apellido = data.Apellido || "familia";

        return { success: true, apellido };
    } catch {
        return { success: false, apellido: "familia" };
    }
};


const actualizarEstado = async (codigoFamilia, estado = "Confirmado") => {
    try {
        // If no codigoFamilia provided, get it from localStorage
        const codigo = codigoFamilia || getCodigoFamilia();
        
        if (!codigo) {
            console.error('No codigoFamilia available');
            return { success: false, error: "No se encontró el código de familia" };
        }

        const response = await fetch(`${urlApi()}families/${codigo}/actualizar-estado`, {
            method: "PATCH",
            headers: getHeaders(),
            mode: 'cors',
            body: JSON.stringify({
                "estado": estado
            })
        });
        
        if (!response.ok) {
            console.error(`actualizar-estado error: ${response.status}`);
            throw new Error("Error en la petición");
        }
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('actualizarEstado error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const SendMessage = async (codigoFamilia, nuevoMensaje) => {
    try {
        // If codigoFamilia is actually the message (old API usage), handle it
        let codigo, mensaje;
        if (typeof codigoFamilia === 'string' && !nuevoMensaje) {
            // Old usage: SendMessage(message)
            codigo = getCodigoFamilia();
            mensaje = codigoFamilia;
        } else {
            // New usage: SendMessage(codigoFamilia, message) or SendMessage(null, message)
            codigo = codigoFamilia || getCodigoFamilia();
            mensaje = nuevoMensaje;
        }
        
        if (!codigo) {
            console.error('No codigoFamilia available');
            return { success: false, error: "No se encontró el código de familia" };
        }

        const response = await fetch(`${urlApi()}families/${codigo}/mensaje`, {
            method: "PATCH",
            headers: getHeaders(),
            mode: 'cors',
            body: JSON.stringify({
                "nuevoMensaje": mensaje
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
        return {
            success: false,
            error: error.message
        };
    }
}

// Additional API functions for complete CRUD operations

const getAllFamilies = async () => {
    try {
        const response = await fetch(`${urlApi()}families`, {
            method: "GET",
            headers: getHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('getAllFamilies error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const createFamily = async (familyData) => {
    try {
        const response = await fetch(`${urlApi()}families`, {
            method: "POST",
            headers: getHeaders(),
            mode: 'cors',
            body: JSON.stringify(familyData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('createFamily error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const deleteFamily = async (id) => {
    try {
        const response = await fetch(`${urlApi()}families/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('deleteFamily error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
const logout = () => {
    clearCodigoFamilia();
};

const apiUtils = {
    urlApi,
    getHeaders,
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
//TO DO
//TItulos color negro
//colores claritos
//