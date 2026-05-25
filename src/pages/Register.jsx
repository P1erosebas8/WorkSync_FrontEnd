import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('jwt_token')) {
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
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correoElectronico, contrasena, rol: 'COLABORADOR' })
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token || data.jwt || data.jwtToken;
                if (token) {
                    localStorage.setItem('jwt_token', token);
                    navigate('/dashboard');
                } else {
                    console.error('El backend no devolvió un token válido', data);
                    setError('Error al procesar la sesión');
                }
            } else {
                setError('El correo ya está en uso o hubo un error');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
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
                        Únete al centro de operaciones para equipos de alto rendimiento. Gestiona proyectos, colabora en tiempo real y escala tu flujo de trabajo con precisión quirúrgica.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-[32px] font-bold text-gray-900 mb-2">Crear Cuenta</h2>
                        <p className="text-[14px] text-gray-500">Únete a WorkSync y mejora la productividad de tu equipo.</p>
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
                                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="Tu Nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
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
                                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="correo@empresa.com"
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
                            <span>Registrarse</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-[14px] text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/" className="text-blue-600 font-semibold hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
