const API_URL = "https://worksync-api-ikx6.onrender.com/api";
export const login = async (credenciales) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
    });

    if (!response.ok) {
        throw new Error('Correo o contraseña incorrectos');
    }

    const data = await response.json();
    const token = data.token || data.jwt || data.jwtToken;
    
    if (token) {
        localStorage.setItem('jwt_token', token);
        return data;
    } else {
        throw new Error('El backend no devolvió un token válido');
    }
};

export const register = async (datosUsuario) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosUsuario)
    });

    if (!response.ok) {
        throw new Error('El correo ya está en uso o hubo un error al registrar');
    }

    const data = await response.json();
    const token = data.token || data.jwt || data.jwtToken;
    
    if (token) {
        localStorage.setItem('jwt_token', token);
        return data;
    } else {
        throw new Error('El backend no devolvió un token válido');
    }
};

export const logout = () => {
    localStorage.removeItem('jwt_token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('jwt_token');
};
