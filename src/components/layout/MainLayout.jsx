import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/');
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="text-gray-100 bg-[#121212] min-h-screen font-['Inter']">
            <Toaster position="top-right" />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeSidebar}
                ></div>
            )}

            <aside className={`fixed left-0 top-0 h-screen w-[260px] bg-black flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="px-6 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-black text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[24px] font-semibold text-white leading-none">WorkSync</span>
                            <span className="text-[11px] font-medium text-gray-400">Pro Workspace</span>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={closeSidebar}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav className="flex-1 space-y-1">
                    <a onClick={() => { navigate('/dashboard'); closeSidebar(); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 mx-2 transition-colors cursor-pointer ${location.pathname === '/dashboard' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-[14px]">Dashboard</span>
                    </a>
                    <a onClick={() => { navigate('/dashboard'); closeSidebar(); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 mx-2 transition-colors cursor-pointer ${location.pathname.startsWith('/kanban') ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>view_kanban</span>
                        <span className="text-[14px]">Proyectos</span>
                    </a>
                </nav>
                <div className="p-4 border-t border-gray-800 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-[14px]">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <main className="md:ml-[260px] min-h-screen flex flex-col w-full md:w-auto">
                <header className="sticky top-0 right-0 h-[64px] bg-[#121212] flex justify-between items-center px-4 md:px-8 border-b border-gray-800 z-30">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-gray-300 hover:text-white p-1" onClick={() => setIsSidebarOpen(true)}>
                            <span className="material-symbols-outlined text-[28px]">menu</span>
                        </button>
                        <h1 className="text-[18px] font-semibold text-gray-100 hidden md:block">WorkSync Workspace</h1>
                    </div>
                    <div className="flex items-center gap-4">
                    </div>
                </header>
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
