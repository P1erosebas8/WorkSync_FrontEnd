import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ proyecto, userRole, onOpenAssignModal, onEdit, onArchive }) {
    const navigate = useNavigate();
    const estado = proyecto.estado || 'ACTIVO';
    const bgColor = estado === 'ARCHIVADO' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700';

    return (
        <div
            onClick={() => navigate(`/kanban/${proyecto.idProyecto}`)}
            className={`group border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative cursor-pointer ${estado === 'ARCHIVADO' ? 'bg-gray-100 opacity-60 grayscale' : 'bg-white'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dataset
                    </span>
                </div>
                <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-tighter ${bgColor}`}>
                    {estado}
                </span>
            </div>

            <h4 className="text-[18px] font-semibold text-gray-900 mb-2 line-clamp-1">{proyecto.nombre}</h4>
            <p className="text-[14px] text-gray-500 mb-6 line-clamp-2 h-10">
                {proyecto.descripcion || 'Sin descripción'}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
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
                                className="ml-2 w-7 h-7 rounded-full bg-orange-50 border-2 border-white flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                                title="Editar Proyecto"
                            >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(proyecto.idProyecto);
                                }}
                                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center transition-colors ${estado === 'ARCHIVADO' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                title={estado === 'ARCHIVADO' ? 'Activar Proyecto' : 'Archivar Proyecto'}
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {estado === 'ARCHIVADO' ? 'unarchive' : 'archive'}
                                </span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAssignModal(proyecto.idProyecto);
                                }}
                                className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Asignar Equipo"
                            >
                                <span className="material-symbols-outlined text-[14px]">person_add</span>
                            </button>
                        </>
                    )}
                </div>
                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {proyecto.fechaCreacion ? new Date(proyecto.fechaCreacion).toLocaleDateString() : ''}
                </span>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-xl pointer-events-none transition-all"></div>
        </div>
    );
}
