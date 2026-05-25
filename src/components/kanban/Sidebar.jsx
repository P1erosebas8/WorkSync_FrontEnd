import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/');
    };

    return (
        <aside className="w-[260px] bg-[#111318] text-white flex flex-col justify-between shrink-0">
            <div className="flex flex-col gap-4 p-4">
                <div className="flex gap-3 items-center mb-6">
                    <div className="bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                        W
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-medium leading-normal">WorkSync</h1>
                        <p className="text-slate-400 text-sm font-normal leading-normal">Tablero</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded bg-slate-800 cursor-pointer">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>view_kanban</span>
                        <p className="text-sm font-medium">Tableros</p>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded transition-colors">
                        <span className="material-symbols-outlined text-white">square</span>
                        <p className="text-sm font-medium">Tareas</p>
                    </div>
                </nav>
            </div>
            
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
