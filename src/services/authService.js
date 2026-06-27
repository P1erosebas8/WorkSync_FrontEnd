const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;
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

export const forgotPassword = async (correoElectronico) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error al solicitar el código');
    }
    return await response.text();
};

export const verifyOtp = async (correoElectronico, otpCode) => {
    const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico, otpCode })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Código OTP inválido');
    }
    return await response.text();
};

export const resetPassword = async (correoElectronico, otpCode, nuevaContrasena) => {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico, otpCode, nuevaContrasena })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error al restablecer la contraseña');
    }
    return await response.text();
};

export const verifyAccount = async (correoElectronico, otpCode) => {
    const response = await fetch(`${API_URL}/verify-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico, otpCode })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Código OTP inválido o expirado');
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

export const googleLogin = async (googleToken) => {
    const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken })
    });
    
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.token || 'Error al autenticar con Google');
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
