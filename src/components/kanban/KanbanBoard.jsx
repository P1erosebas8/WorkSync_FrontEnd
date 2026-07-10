import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KanbanColumn from './KanbanColumn';
import { DndContext, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import MetricsModal from './MetricsModal';
import toast from 'react-hot-toast';
import { obtenerTareasProyecto, actualizarEstadoTarea, crearTarea } from '../../services/tareaService';
import { obtenerAsignacionesProyecto } from '../../services/proyectoService';

const pesosPrioridad = {
    'ALTA': 1,
    'MEDIA': 2,
    'BAJA': 3
};

export default function KanbanBoard() {
    const [tareas, setTareas] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
    const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
    const [nuevaTarea, setNuevaTarea] = useState({ title: '', description: '', priority: 'MEDIA', idResponsable: '' });
    const [userRole, setUserRole] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('TODAS');
    const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [nombreProyecto, setNombreProyecto] = useState('');
    const navigate = useNavigate();
    const { projectId } = useParams();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

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
                const role = decodedPayload.roles[0].authority || decodedPayload.roles[0];
                setUserRole(role);
                if (role === 'ROLE_COLABORADOR' || role === 'COLABORADOR') {
                    setShowOnlyMyTasks(true);
                }
            }
            if (decodedPayload.userId) {
                setCurrentUserId(decodedPayload.userId);
            }
        } catch (e) {
            console.error("Error decodificando token", e);
        }

        obtenerTareasProyecto(projectId)
            .then(data => setTareas(data))
            .catch(err => {
                if (err.message === 'Sesión expirada o no autorizada') {
                    localStorage.removeItem('jwt_token');
                    navigate('/');
                }
                console.error("Error cargando tareas:", err);
            });

        import('../../services/proyectoService').then(({ obtenerProyectos }) => {
            obtenerProyectos().then(proyectos => {
                const p = proyectos.find(p => p.projectId == projectId);
                if (p) setNombreProyecto(p.name);
            });
        });

        obtenerAsignacionesProyecto(projectId)
            .then(data => setColaboradores(data.map(a => a.user)))
            .catch(err => console.error("Error cargando colaboradores:", err));
    }, [navigate, projectId]);

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tareas.find(t => t.taskId === active.id);
        setActiveTask(task);
    };

    const handleDragEnd = (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        const nuevoEstado = over.id;
        const tareaArrastrada = active.data.current?.tarea;

        if (!tareaArrastrada || tareaArrastrada.status === nuevoEstado) return;

        const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

        if (!isAdmin && tareaArrastrada.assigneeId !== currentUserId) {
            toast.error('Solo puedes mover tus propias tareas');
            return;
        }

        if (!isAdmin && (nuevoEstado === 'BLOQUEADO' || nuevoEstado === 'COMPLETADO' || tareaArrastrada.status === 'BLOQUEADO' || tareaArrastrada.status === 'COMPLETADO')) {
            toast.error('Solo el administrador puede mover tareas bloqueadas o completadas');
            return;
        }

        const estadoAnterior = tareaArrastrada.status;
        setTareas(tareasPrevias =>
            tareasPrevias.map(t =>
                t.taskId === taskId ? { ...t, status: nuevoEstado } : t
            )
        );

        actualizarEstadoTarea(taskId, nuevoEstado)
            .then(() => toast.success('Estado actualizado'))
            .catch(err => {
                toast.error(err.message || 'Error actualizando estado');
                setTareas(tareasPrevias =>
                    tareasPrevias.map(t =>
                        t.taskId === taskId ? { ...t, status: estadoAnterior } : t
                    )
                );
            });
    };

    const cerrarModalYLimpiar = () => {
        setNuevaTarea({ title: '', description: '', priority: 'MEDIA', assigneeId: '', dependsOnTaskId: '' });
        setIsTaskModalOpen(false);
    };

    const handleCrearTarea = async (e) => {
        e.preventDefault();
        try {
            const data = await crearTarea(nuevaTarea, projectId);
            setTareas([...tareas, data]);
            cerrarModalYLimpiar();
            toast.success('Tarea creada correctamente');
        } catch (error) {
            toast.error('Error al guardar la tarea');
            console.error("Error al crear tarea:", error);
        }
    };

    const tareasFiltradas = tareas.map(t => {
        let isLocked = false;
        let dependsOnTaskTitle = '';
        if (t.dependsOnTaskId) {
            const parent = tareas.find(p => p.taskId == t.dependsOnTaskId);
            if (parent) {
                dependsOnTaskTitle = parent.title;
                if (parent.status !== 'COMPLETADO') {
                    isLocked = true;
                }
            }
        }
        return { ...t, isLocked, dependsOnTaskTitle };
    }).filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchPriority = filterPriority === 'TODAS' || t.priority === filterPriority;
        const matchUser = !showOnlyMyTasks || t.assigneeId === currentUserId;
        return matchSearch && matchPriority && matchUser;
    });

    const tareasPendientes = tareasFiltradas
        .filter(t => t.status === 'PENDIENTE')
        .sort((a, b) => pesosPrioridad[a.priority] - pesosPrioridad[b.priority]);
    const tareasEnProgreso = tareasFiltradas
        .filter(t => t.status === 'EN_PROGRESO')
        .sort((a, b) => pesosPrioridad[a.priority] - pesosPrioridad[b.priority]);
    const tareasEnRevision = tareasFiltradas
        .filter(t => t.status === 'EN_REVISION')
        .sort((a, b) => pesosPrioridad[a.priority] - pesosPrioridad[b.priority]);
    const tareasBloqueadas = tareasFiltradas
        .filter(t => t.status === 'BLOQUEADO')
        .sort((a, b) => pesosPrioridad[a.priority] - pesosPrioridad[b.priority]);
    const tareasCompletadas = tareasFiltradas
        .filter(t => t.status === 'COMPLETADO')
        .sort((a, b) => pesosPrioridad[a.priority] - pesosPrioridad[b.priority]);

    return (
        <div className="flex h-full flex-col min-w-0">
            <header className="flex items-center justify-between border-b border-gray-800 px-6 h-16 bg-[#1a1a1a] shrink-0 gap-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-gray-200">grid_view</span>
                    <h2 className="text-lg font-bold truncate hidden sm:block text-gray-100">Proyecto {nombreProyecto || projectId}</h2>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    <button 
                        onClick={() => setIsMetricsModalOpen(true)}
                        className="p-1.5 rounded-lg border border-gray-800 bg-[#121212] text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                        title="Ver Estadísticas"
                    >
                        <span className="material-symbols-outlined text-[20px]">monitoring</span>
                    </button>
                    <button
                        onClick={() => setShowOnlyMyTasks(!showOnlyMyTasks)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${showOnlyMyTasks ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-gray-800 text-gray-300 border border-transparent hover:bg-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {showOnlyMyTasks ? 'person' : 'group'}
                        </span>
                        {showOnlyMyTasks ? 'Mis Tareas' : 'Todas'}
                    </button>

                    <div className="relative w-full max-w-xs ml-2">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-gray-800 bg-[#121212] rounded-lg text-sm text-white focus:ring-2 focus:ring-red-500/20 outline-none w-full"
                        />
                    </div>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="py-1.5 px-3 border border-gray-800 bg-[#121212] rounded-lg text-sm text-white focus:ring-2 focus:ring-red-500/20 outline-none"
                    >
                        <option value="TODAS">Prioridad (Todas)</option>
                        <option value="ALTA">Alta</option>
                        <option value="MEDIA">Media</option>
                        <option value="BAJA">Baja</option>
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#121212]">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-6 items-start pb-4">
                        <KanbanColumn
                            id="PENDIENTE"
                            titulo="Pendiente"
                            tareas={tareasPendientes}
                            onAddTask={(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') ? () => setIsTaskModalOpen(true) : null}
                            onTaskClick={setSelectedTaskForDetails}
                        />
                        <KanbanColumn
                            id="EN_PROGRESO"
                            titulo="En Progreso"
                            tareas={tareasEnProgreso}
                            onTaskClick={setSelectedTaskForDetails}
                        />
                        <KanbanColumn
                            id="EN_REVISION"
                            titulo="En Revisión"
                            tareas={tareasEnRevision}
                            onTaskClick={setSelectedTaskForDetails}
                        />
                        <KanbanColumn
                            id="BLOQUEADO"
                            titulo="Bloqueado"
                            tareas={tareasBloqueadas}
                            onTaskClick={setSelectedTaskForDetails}
                        />
                        <KanbanColumn
                            id="COMPLETADO"
                            titulo="Completado"
                            tareas={tareasCompletadas}
                            onTaskClick={setSelectedTaskForDetails}
                        />
                    </div>

                    <DragOverlay>
                        {activeTask ? <TaskCard tarea={activeTask} isOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Nueva Tarea</h2>

                        <form onSubmit={handleCrearTarea} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-800 bg-[#121212] text-white rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                                    placeholder="Ej. Integrar pasarela de pago"
                                    value={nuevaTarea.title}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Descripción</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-800 bg-[#121212] text-white rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                    placeholder="Detalles de la tarea..."
                                    value={nuevaTarea.description}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Prioridad</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-800 bg-[#121212] text-white rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                                    value={nuevaTarea.priority}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, priority: e.target.value })}
                                >
                                    <option value="ALTA">Alta</option>
                                    <option value="MEDIA">Media</option>
                                    <option value="BAJA">Baja</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Responsable</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-800 bg-[#121212] text-white rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                                    value={nuevaTarea.assigneeId || ''}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, assigneeId: e.target.value })}
                                >
                                    <option value="">Sin asignar</option>
                                    {colaboradores.filter(u => u != null).map(user => (
                                        <option key={user.userId} value={user.userId}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Depende de (Opcional)</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-800 bg-[#121212] text-white rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                                    value={nuevaTarea.dependsOnTaskId || ''}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, dependsOnTaskId: e.target.value })}
                                >
                                    <option value="">Ninguna dependencia</option>
                                    {tareas.map(t => (
                                        <option key={t.taskId} value={t.taskId}>
                                            {t.title}
                                        </option>
                                    ))}
                                </select>
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
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Crear Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedTaskForDetails && (
                <TaskModal
                    tarea={selectedTaskForDetails}
                    onClose={() => setSelectedTaskForDetails(null)}
                    colaboradores={colaboradores}
                    onReassign={async (taskId, newAssigneeId) => {
                        try {
                            const { actualizarTarea } = await import('../../services/tareaService');
                            const tareaActualizada = await actualizarTarea(taskId, { ...selectedTaskForDetails, assigneeId: newAssigneeId });
                            setTareas(tareasPrevias => tareasPrevias.map(t => t.taskId === taskId ? tareaActualizada : t));
                            setSelectedTaskForDetails(tareaActualizada);
                            toast.success("Reasignado correctamente");
                        } catch(e) {
                            toast.error("Error al reasignar la tarea");
                        }
                    }}
                />
            )}

            {isMetricsModalOpen && (
                <MetricsModal 
                    projectId={projectId} 
                    onClose={() => setIsMetricsModalOpen(false)} 
                />
            )}
        </div>
    );
}
