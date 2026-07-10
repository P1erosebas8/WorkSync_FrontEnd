import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/dashboard/ProjectCard';
import toast from 'react-hot-toast';
import { 
    obtenerProyectos, 
    obtenerUsuarios, 
    crearProyecto, 
    asignarUsuario, 
    actualizarProyecto, 
    archivarProyecto 
} from '../services/proyectoService';

export default function Dashboard() {
    const [proyectos, setProyectos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoProyecto, setNuevoProyecto] = useState({ name: '', description: '', deadline: '' });
    const [userRole, setUserRole] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [proyectoEdit, setProyectoEdit] = useState(null);
    const [usuariosList, setUsuariosList] = useState([]);
    const [colaboradoresAsignadosIds, setColaboradoresAsignadosIds] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
    const [confirmArchive, setConfirmArchive] = useState({ isOpen: false, projectId: null, isArchive: true });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            if (decodedPayload.roles && decodedPayload.roles.length > 0) {
                setUserRole(decodedPayload.roles[0].authority || decodedPayload.roles[0]);
            }
        } catch(e) {
            console.error("Error decodificando token", e);
        }

        obtenerProyectos()
            .then(data => setProyectos(data))
            .catch(err => {
                if (err.message === 'No autorizado') {
                    localStorage.removeItem('jwt_token');
                    navigate('/');
                }
                console.error("Error obteniendo proyectos:", err);
            });

        obtenerUsuarios()
            .then(data => setUsuariosList(data))
            .catch(err => console.error("Error obteniendo usuarios:", err));
    }, [navigate]);

    const cerrarModalYLimpiar = () => {
        setNuevoProyecto({ name: '', description: '', deadline: '' });
        setIsModalOpen(false);
    };

    const handleCrearProyecto = async (e) => {
        e.preventDefault();
        
        try {
            const data = await crearProyecto(nuevoProyecto);
            setProyectos([...proyectos, data]);
            cerrarModalYLimpiar();
            toast.success('Proyecto creado con éxito');
        } catch (error) {
            toast.error('Error al crear el proyecto');
            console.error("Error de red:", error);
        }
    };

    const handleAsignarUsuario = async (e) => {
        e.preventDefault();
        if (!selectedUsuarioId || !selectedProjectId) return;
        
        try {
            await asignarUsuario(selectedUsuarioId, selectedProjectId);
            setIsAssignModalOpen(false);
            setSelectedUsuarioId('');
            setSelectedProjectId(null);
            toast.success('Usuario asignado correctamente');
        } catch (error) {
            toast.error('Error al asignar usuario');
            console.error("Error de red:", error);
        }
    };

    const handleActualizarProyecto = async (e) => {
        e.preventDefault();
        try {
            const updated = await actualizarProyecto(proyectoEdit.projectId, proyectoEdit);
            setProyectos(proyectos.map(p => p.projectId === updated.projectId ? updated : p));
            setIsEditModalOpen(false);
            setProyectoEdit(null);
            toast.success('Proyecto actualizado');
        } catch (error) {
            toast.error('Error al actualizar el proyecto');
            console.error("Error al actualizar proyecto:", error);
        }
    };

    const handleArchivar = (projectId, isArchive) => {
        setConfirmArchive({ isOpen: true, projectId, isArchive });
    };

    const executeArchive = async () => {
        if (!confirmArchive.projectId) return;
        try {
            await archivarProyecto(confirmArchive.projectId);
            setProyectos(prevProyectos => prevProyectos.map(p => 
                p.projectId === confirmArchive.projectId 
                    ? { ...p, status: p.status === 'ARCHIVADO' ? 'ACTIVO' : 'ARCHIVADO' } 
                    : p
            ));
            toast.success('Estado del proyecto actualizado');
        } catch (error) {
            toast.error('Error al cambiar el estado del proyecto');
            console.error("Error al actualizar proyecto:", error);
        }
        setConfirmArchive({ isOpen: false, projectId: null, isArchive: true });
    };

    return (
        <>
            <section className="p-8 relative">
                <div className="p-8 rounded-xl bg-gradient-to-br from-black to-gray-800 text-white relative overflow-hidden shadow-sm mb-8">
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-[32px] font-bold mb-2">Resumen de Proyectos</h2>
                        <p className="text-[16px] text-gray-300 mb-6">Selecciona un proyecto activo para entrar al Tablero Kanban y empezar a gestionar las tareas de tu equipo.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[18px] font-semibold text-gray-100">Proyectos Recientes</h3>
                        <span className="bg-[#1a1a1a] border border-gray-800 px-2 py-0.5 rounded text-[11px] font-bold text-gray-400">{proyectos.length} Total</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos.map(proyecto => (
                        <ProjectCard 
                            key={proyecto.projectId} 
                            proyecto={proyecto} 
                            userRole={userRole}
                            onOpenAssignModal={async (id) => {
                                setSelectedProjectId(id);
                                try {
                                    const { obtenerAsignacionesProyecto } = await import('../services/proyectoService');
                                    const asignaciones = await obtenerAsignacionesProyecto(id);
                                    setColaboradoresAsignadosIds(asignaciones.map(a => a.user ? a.user.userId : null));
                                } catch(e) {
                                    console.error("Error cargando asignados", e);
                                    setColaboradoresAsignadosIds([]);
                                }
                                setIsAssignModalOpen(true);
                            }}
                            onEdit={(p) => {
                                setProyectoEdit(p);
                                setIsEditModalOpen(true);
                            }}
                            onArchive={(id) => handleArchivar(id, proyecto.status !== 'ARCHIVADO')}
                        />
                    ))}

                    {(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') && (
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-red-500/50 transition-all bg-[#1a1a1a]/50 min-h-[220px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#121212] flex items-center justify-center mb-4 group-hover:bg-red-900/30 group-hover:text-red-400 transition-colors">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-red-400">add_circle</span>
                            </div>
                            <h4 className="text-[16px] font-bold text-gray-200 mb-1">Iniciar nuevo proyecto</h4>
                            <p className="text-[12px] text-gray-500">Define objetivos, asigna equipo y comienza.</p>
                        </div>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Nuevo Proyecto</h2>
                        
                        <form onSubmit={handleCrearProyecto} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Título del Proyecto</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                                    placeholder="Ej. Rediseño Web"
                                    value={nuevoProyecto.name}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Descripción</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none resize-none"
                                    placeholder="Objetivo principal del proyecto..."
                                    value={nuevoProyecto.description}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, description: e.target.value})}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Límite</label>
                                <input 
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    value={nuevoProyecto.deadline}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, deadline: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={cerrarModalYLimpiar}
                                    className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Crear Proyecto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Asignar Usuario a Proyecto</h2>
                        
                        <form onSubmit={handleAsignarUsuario} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Seleccionar Usuario</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                                    value={selectedUsuarioId}
                                    onChange={(e) => setSelectedUsuarioId(e.target.value)}
                                >
                                    <option value="" disabled>Elige un colaborador...</option>
                                    {usuariosList.filter(u => !colaboradoresAsignadosIds.includes(u.userId)).map(u => (
                                        <option key={u.userId} value={u.userId}>
                                            {u.name || u.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsAssignModalOpen(false);
                                        setSelectedUsuarioId('');
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Asignar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && proyectoEdit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Editar Proyecto</h2>
                        
                        <form onSubmit={handleActualizarProyecto} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Nombre del Proyecto</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                                    value={proyectoEdit.name || ''}
                                    onChange={(e) => setProyectoEdit({...proyectoEdit, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Descripción</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none resize-none"
                                    value={proyectoEdit.description || ''}
                                    onChange={(e) => setProyectoEdit({...proyectoEdit, description: e.target.value})}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Fecha Límite</label>
                                <input 
                                    type="date"
                                    className="w-full px-4 py-2 bg-[#121212] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                                    value={proyectoEdit.deadline || ''}
                                    onChange={(e) => setProyectoEdit({...proyectoEdit, deadline: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setProyectoEdit(null);
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {confirmArchive.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmArchive.isArchive ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                            <span className="material-symbols-outlined text-3xl">
                                {confirmArchive.isArchive ? 'archive' : 'unarchive'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {confirmArchive.isArchive ? '¿Archivar Proyecto?' : '¿Activar Proyecto?'}
                        </h2>
                        <p className="text-gray-400 mb-6">
                            {confirmArchive.isArchive 
                                ? 'El proyecto pasará a estado archivado y no admitirá modificaciones.' 
                                : 'El proyecto volverá a estar activo y su equipo podrá trabajar en él.'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setConfirmArchive({ isOpen: false, projectId: null, isArchive: true })}
                                className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executeArchive}
                                className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${confirmArchive.isArchive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
