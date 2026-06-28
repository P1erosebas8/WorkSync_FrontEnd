import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, isAuthenticated, verifyAccount, googleLogin } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [verifyStep, setVerifyStep] = useState(0);
    const [verifyOtpCode, setVerifyOtpCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(contrasena)) {
            toast.error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo especial (@$!%*?&).', { duration: 5000 });
            return;
        }

        try {
            const response = await register({
                nombre,
                correoElectronico,
                contrasena,
                rol: 'COLABORADOR'
            });
            toast.success("Cuenta creada. Revisa tu correo electrónico para el código OTP.");
            setVerifyStep(1);
        } catch (err) {
            setError(err.message || 'Error de conexión con el servidor');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al registrar con Google');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setVerifyLoading(true);
        try {
            await verifyAccount(correoElectronico, verifyOtpCode);
            toast.success("Cuenta verificada exitosamente. ¡Bienvenido!");
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Código inválido');
        } finally {
            setVerifyLoading(false);
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
                        Únete al centro de operaciones para equipos de alto rendimiento. Gestiona proyectos, colabora en tiempo real y escala tu flujo de trabajo con precisión quirúrgica.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#121212]">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-[32px] font-bold text-white mb-2">Crear Cuenta</h2>
                        <p className="text-[14px] text-gray-400">Únete a WorkSync y mejora la productividad de tu equipo.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div className="space-y-2">
                            <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider">
                                Nombre Completo
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        person
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="Tu Nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    disabled={verifyStep === 1}
                                />
                            </div>
                        </div>

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
                                    placeholder="correo@empresa.com"
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                    required
                                    disabled={verifyStep === 1}
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
                                    className="block w-full pl-10 pr-12 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                    disabled={verifyStep === 1}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={verifyStep === 1}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={verifyStep === 1}
                            className="w-full py-4 px-6 bg-black text-white text-[16px] font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Registrarse</span>
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="h-px bg-gray-800 flex-1"></div>
                        <span className="text-gray-500 text-[12px] font-semibold uppercase tracking-wider">O regístrate con</span>
                        <div className="h-px bg-gray-800 flex-1"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Error al autenticar con Google')}
                            shape="rectangular"
                            size="large"
                            theme="outline"
                            text="signup_with"
                        />
                    </div>

                    <div className="mt-6 text-center text-[14px] text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/" className="text-blue-600 font-semibold hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>

            {verifyStep === 1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                        </div>
                        <h3 className="text-[24px] font-bold text-center text-white mb-2">
                            Revisa tu correo
                        </h3>
                        <p className="text-[14px] text-center text-gray-400 mb-6">
                            Hemos enviado un código de 6 dígitos a <strong>{correoElectronico}</strong>.
                            Por favor, ingrésalo abajo para activar tu cuenta.
                        </p>

                        <form onSubmit={handleVerifySubmit} className="space-y-5">
                            <input
                                type="text"
                                className="block w-full px-4 py-4 bg-[#121212] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center tracking-[0.5em] font-bold text-2xl transition-all"
                                placeholder="000000"
                                maxLength="6"
                                value={verifyOtpCode}
                                onChange={(e) => setVerifyOtpCode(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                disabled={verifyLoading || verifyOtpCode.length !== 6}
                                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                            >
                                {verifyLoading ? "Verificando..." : "Verificar y Entrar"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
