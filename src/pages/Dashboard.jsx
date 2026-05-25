import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/dashboard/ProjectCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [proyectos, setProyectos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '' });
    const [userRole, setUserRole] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [proyectoEdit, setProyectoEdit] = useState(null);
    const [usuariosList, setUsuariosList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
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

        fetch('http://localhost:8080/api/proyectos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('jwt_token');
                    navigate('/');
                    throw new Error('No autorizado');
                }
                if (!res.ok) throw new Error('Error al cargar proyectos');
                return res.json();
            })
            .then(data => setProyectos(data))
            .catch(err => console.error("Error obteniendo proyectos:", err));

        fetch('http://localhost:8080/api/usuarios', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => setUsuariosList(data))
            .catch(err => console.error("Error obteniendo usuarios:", err));
    }, [navigate]);

    const handleCrearProyecto = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        
        try {
            const response = await fetch('http://localhost:8080/api/proyectos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoProyecto)
            });

            if (response.ok) {
                const data = await response.json();
                setProyectos([...proyectos, data]);
                setNuevoProyecto({ nombre: '', descripcion: '' });
                setIsModalOpen(false);
                toast.success('Proyecto creado con éxito');
            } else {
                toast.error('Error al crear el proyecto');
                console.error("Error al crear proyecto");
            }
        } catch (error) {
            toast.error('Error al crear el proyecto');
            console.error("Error de red:", error);
        }
    };

    const handleAsignarUsuario = async (e) => {
        e.preventDefault();
        if (!selectedUsuarioId || !selectedProjectId) return;
        
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch('http://localhost:8080/api/asignaciones', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUsuario: selectedUsuarioId, idProyecto: selectedProjectId })
            });

            if (response.ok) {
                setIsAssignModalOpen(false);
                setSelectedUsuarioId('');
                setSelectedProjectId(null);
                toast.success('Usuario asignado correctamente');
            } else {
                toast.error('Error al asignar usuario');
                console.error("Error al asignar usuario");
            }
        } catch (error) {
            toast.error('Error al asignar usuario');
            console.error("Error de red:", error);
        }
    };

    const handleActualizarProyecto = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch(`http://localhost:8080/api/proyectos/${proyectoEdit.idProyecto}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proyectoEdit)
            });

            if (response.ok) {
                const updated = await response.json();
                setProyectos(proyectos.map(p => p.idProyecto === updated.idProyecto ? updated : p));
                setIsEditModalOpen(false);
                setProyectoEdit(null);
                toast.success('Proyecto actualizado');
            } else {
                toast.error('Error al actualizar el proyecto');
            }
        } catch (error) {
            toast.error('Error al actualizar el proyecto');
            console.error("Error al actualizar proyecto:", error);
        }
    };

    const handleArchivar = async (idProyecto) => {
        if (!window.confirm("¿Estás seguro de cambiar el estado de este proyecto?")) return;
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch(`http://localhost:8080/api/proyectos/${idProyecto}/archivar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await response.json();
                setProyectos(prevProyectos => prevProyectos.map(p => 
                    p.idProyecto === idProyecto 
                        ? { ...p, estado: p.estado === 'ARCHIVADO' ? 'ACTIVO' : 'ARCHIVADO' } 
                        : p
                ));
                toast.success('Estado del proyecto actualizado');
            } else {
                toast.error('Error al cambiar el estado del proyecto');
            }
        } catch (error) {
            toast.error('Error al cambiar el estado del proyecto');
            console.error("Error al actualizar proyecto:", error);
        }
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
                        <h3 className="text-[18px] font-semibold">Proyectos Recientes</h3>
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-[11px] font-bold text-gray-600">{proyectos.length} Total</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos.map(proyecto => (
                        <ProjectCard 
                            key={proyecto.idProyecto} 
                            proyecto={proyecto} 
                            userRole={userRole}
                            onOpenAssignModal={(id) => {
                                setSelectedProjectId(id);
                                setIsAssignModalOpen(true);
                            }}
                            onEdit={(p) => {
                                setProyectoEdit(p);
                                setIsEditModalOpen(true);
                            }}
                            onArchive={handleArchivar}
                        />
                    ))}

                    {(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') && (
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-500 transition-all bg-white/50 min-h-[220px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                            </div>
                            <h4 className="text-[16px] font-bold text-gray-700 mb-1">Iniciar nuevo proyecto</h4>
                            <p className="text-[12px] text-gray-500">Define objetivos, asigna equipo y comienza.</p>
                        </div>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Proyecto</h2>
                        
                        <form onSubmit={handleCrearProyecto} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Título del Proyecto</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej. Rediseño Web"
                                    value={nuevoProyecto.nombre}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Objetivo principal del proyecto..."
                                    value={nuevoProyecto.descripcion}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Asignar Usuario a Proyecto</h2>
                        
                        <form onSubmit={handleAsignarUsuario} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Usuario</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedUsuarioId}
                                    onChange={(e) => setSelectedUsuarioId(e.target.value)}
                                >
                                    <option value="" disabled>Elige un colaborador...</option>
                                    {usuariosList.map(u => (
                                        <option key={u.idUsuario} value={u.idUsuario}>
                                            {u.nombre || u.correoElectronico}
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
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Asignar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && proyectoEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Proyecto</h2>
                        
                        <form onSubmit={handleActualizarProyecto} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Proyecto</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={proyectoEdit.nombre || ''}
                                    onChange={(e) => setProyectoEdit({...proyectoEdit, nombre: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={proyectoEdit.descripcion || ''}
                                    onChange={(e) => setProyectoEdit({...proyectoEdit, descripcion: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setProyectoEdit(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
