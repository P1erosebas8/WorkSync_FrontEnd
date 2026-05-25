import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, isAuthenticated } from '../services/authService';

export default function Login() {
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ correoElectronico, contrasena });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error de conexión con el servidor');
        }
    };

    return (
        <div className="flex min-h-screen w-full font-['Inter'] bg-[#fcf8fa]">
            <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center p-12 overflow-hidden" 
                 style={{ backgroundImage: 'radial-gradient(at 0% 0%, hsla(222,47%,11%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(221,45%,15%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(220,40%,10%,1) 0, transparent 50%)' }}>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8 flex items-center justify-center w-24 h-24 bg-white rounded-xl shadow-2xl">
                        <span className="material-symbols-outlined text-[48px] text-black">hub</span>
                    </div>
                    <h1 className="text-[32px] font-bold text-white mb-4 tracking-tight">WorkSync</h1>
                    <p className="text-[16px] text-gray-300 max-w-md mx-auto">
                        El centro de operaciones para equipos de alto rendimiento. Gestiona proyectos, colabora en tiempo real y escala tu flujo de trabajo con precisión quirúrgica.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-[32px] font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
                        <p className="text-[14px] text-gray-500">Bienvenido de nuevo. Por favor, ingresa tus credenciales.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        alternate_email
                                    </span>
                                </div>
                                <input 
                                    type="email" 
                                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="admin@worksync.com"
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        lock
                                    </span>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="block w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 px-6 bg-black text-white text-[16px] font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group"
                        >
                            <span>Entrar</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-[14px] text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                            Regístrate aquí
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}