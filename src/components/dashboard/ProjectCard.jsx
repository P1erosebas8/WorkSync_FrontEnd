import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ proyecto, userRole, onOpenAssignModal, onEdit, onArchive }) {
    const navigate = useNavigate();
    const estado = proyecto.status || 'ACTIVO';
    const bgCard = estado === 'ARCHIVADO' ? 'bg-[#1a1a1a] opacity-60 grayscale' : 'bg-[#1a1a1a]';
    const bgColor = estado === 'ARCHIVADO' ? 'bg-gray-800 text-gray-400' : 'bg-green-900/30 text-green-400';

    return (
        <div
            onClick={() => navigate(`/kanban/${proyecto.projectId}`)}
            className={`group border border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative cursor-pointer ${bgCard}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-900/30 flex items-center justify-center text-red-400">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dataset
                    </span>
                </div>
                <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-tighter ${bgColor}`}>
                    {estado}
                </span>
            </div>

            <h4 className="text-[18px] font-semibold text-gray-100 mb-2 line-clamp-1">{proyecto.name}</h4>
            <p className="text-[14px] text-gray-400 mb-6 line-clamp-2 h-10">
                {proyecto.description || 'Sin descripción'}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                    </div>
                    {(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(proyecto);
                                }}
                                className="ml-2 w-7 h-7 rounded-full bg-orange-900/30 border border-gray-800 flex items-center justify-center text-orange-400 hover:bg-orange-900/50 transition-colors"
                                title="Editar Proyecto"
                            >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(proyecto.projectId);
                                }}
                                className={`w-7 h-7 rounded-full border border-gray-800 flex items-center justify-center transition-colors ${estado === 'ARCHIVADO' ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'}`}
                                title={estado === 'ARCHIVADO' ? 'Activar Proyecto' : 'Archivar Proyecto'}
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {estado === 'ARCHIVADO' ? 'unarchive' : 'archive'}
                                </span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAssignModal(proyecto.projectId);
                                }}
                                className="w-7 h-7 rounded-full bg-red-900/30 border border-gray-800 flex items-center justify-center text-red-400 hover:bg-red-900/50 transition-colors"
                                title="Asignar Equipo"
                            >
                                <span className="material-symbols-outlined text-[14px]">person_add</span>
                            </button>
                        </>
                    )}
                </div>
                <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {proyecto.startDate ? new Date(proyecto.startDate).toLocaleDateString() : (proyecto.deadline ? new Date(proyecto.deadline).toLocaleDateString() : 'Sin fecha')}
                </span>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/10 rounded-xl pointer-events-none transition-all"></div>
        </div>
    );
}
