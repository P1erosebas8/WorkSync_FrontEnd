import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, isAuthenticated, forgotPassword, verifyOtp, resetPassword, googleLogin } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [forgotStep, setForgotStep] = useState(0);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión con Google');
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            if (forgotStep === 1) {
                await forgotPassword(resetEmail);
                toast.success("Código enviado a tu correo");
                setForgotStep(2);
            } else if (forgotStep === 2) {
                await verifyOtp(resetEmail, resetOtp);
                toast.success("Código verificado");
                setForgotStep(3);
            } else if (forgotStep === 3) {
                await resetPassword(resetEmail, resetOtp, newPassword);
                toast.success("Contraseña actualizada exitosamente");
                setForgotStep(0);
                setCorreoElectronico(resetEmail);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-['Inter'] bg-[#121212]">
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

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#121212]">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-[32px] font-bold text-white mb-2">Iniciar Sesión</h2>
                        <p className="text-[14px] text-gray-400">Bienvenido de nuevo. Por favor, ingresa tus credenciales.</p>
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
                                    className="block w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="admin@worksync.com"
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider">
                                    Contraseña
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotStep(1);
                                        setResetEmail(correoElectronico);
                                    }}
                                    className="text-[12px] text-blue-600 font-medium hover:underline focus:outline-none"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        lock
                                    </span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-10 pr-12 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="h-px bg-gray-800 flex-1"></div>
                        <span className="text-gray-500 text-[12px] font-semibold uppercase tracking-wider">O entra con</span>
                        <div className="h-px bg-gray-800 flex-1"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Error al autenticar con Google')}
                            shape="rectangular"
                            size="large"
                            theme="outline"
                            text="signin_with"
                        />
                    </div>

                    <div className="mt-6 text-center text-[14px] text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                            Regístrate aquí
                        </Link>
                    </div>
                </div>
            </div>

            {forgotStep > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                        <button
                            onClick={() => setForgotStep(0)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-[24px] font-bold text-gray-900 mb-2">
                            {forgotStep === 1 && "Recuperar Contraseña"}
                            {forgotStep === 2 && "Ingresar Código"}
                            {forgotStep === 3 && "Nueva Contraseña"}
                        </h3>
                        <p className="text-[14px] text-gray-500 mb-6">
                            {forgotStep === 1 && "Ingresa tu correo para recibir un código de verificación."}
                            {forgotStep === 2 && `Hemos enviado un código de 6 dígitos a ${resetEmail}`}
                            {forgotStep === 3 && "Ingresa tu nueva contraseña para acceder a tu cuenta."}
                        </p>

                        <form onSubmit={handleForgotSubmit} className="space-y-5">
                            {forgotStep === 1 && (
                                <input
                                    type="email"
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                                    placeholder="correo@worksync.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                            )}

                            {forgotStep === 2 && (
                                <input
                                    type="text"
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-[0.5em] font-bold text-xl transition-all"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={resetOtp}
                                    onChange={(e) => setResetOtp(e.target.value)}
                                    required
                                />
                            )}

                            {forgotStep === 3 && (
                                <input
                                    type="password"
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                    placeholder="Nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength="8"
                                    required
                                />
                            )}

                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {resetLoading ? "Procesando..." : "Continuar"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}