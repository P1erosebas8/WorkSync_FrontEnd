import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KanbanColumn from './KanbanColumn';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import toast from 'react-hot-toast';

const pesosPrioridad = {
    'ALTA': 1,
    'MEDIA': 2,
    'BAJA': 3
};

export default function KanbanBoard() {
    const [tareas, setTareas] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', descripcion: '', prioridad: 'MEDIA' });
    const [userRole, setUserRole] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const navigate = useNavigate();
    const { idProyecto } = useParams();

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

        fetch(`http://localhost:8080/api/tareas/proyecto/${idProyecto}`, {
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
                    throw new Error('Sesión expirada o no autorizada');
                }
                if (!res.ok) throw new Error('Error al cargar tareas');
                return res.json();
            })
            .then(data => setTareas(data))
            .catch(err => console.error("Error cargando tareas:", err));
    }, [navigate, idProyecto]);

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tareas.find(t => t.idTarea === active.id);
        setActiveTask(task);
    };

    const handleDragEnd = (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const idTarea = active.id;
        const nuevoEstado = over.id;
        const tareaArrastrada = active.data.current?.tarea;

        if (!tareaArrastrada || tareaArrastrada.estado === nuevoEstado) return;

        setTareas(tareasPrevias =>
            tareasPrevias.map(t =>
                t.idTarea === idTarea ? { ...t, estado: nuevoEstado } : t
            )
        );

        const token = localStorage.getItem('jwt_token');
        fetch(`http://localhost:8080/api/tareas/${idTarea}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        .then(res => {
            if (res.ok) {
                toast.success('Estado actualizado');
            } else {
                toast.error('Error actualizando estado');
            }
        })
        .catch(err => {
            toast.error('Error actualizando estado');
            console.error("Error actualizando tarea:", err);
        });
    };

    const handleCrearTarea = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch('http://localhost:8080/api/tareas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...nuevaTarea,
                    estado: 'PENDIENTE',
                    proyecto: {
                        idProyecto: parseInt(idProyecto)
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTareas([...tareas, data]);
                setNuevaTarea({ titulo: '', descripcion: '', prioridad: 'MEDIA' });
                setIsTaskModalOpen(false);
                toast.success('Tarea creada correctamente');
            } else {
                toast.error('Error al guardar la tarea');
                console.error("Error al crear tarea");
            }
        } catch (error) {
            toast.error('Error al guardar la tarea');
            console.error("Error de red:", error);
        }
    };

    const tareasPendientes = tareas
        .filter(t => t.estado === 'PENDIENTE')
        .sort((a, b) => pesosPrioridad[a.prioridad] - pesosPrioridad[b.prioridad]);
    const tareasEnProgreso = tareas
        .filter(t => t.estado === 'EN_PROGRESO')
        .sort((a, b) => pesosPrioridad[a.prioridad] - pesosPrioridad[b.prioridad]);
    const tareasCompletadas = tareas
        .filter(t => t.estado === 'COMPLETADO')
        .sort((a, b) => pesosPrioridad[a.prioridad] - pesosPrioridad[b.prioridad]);

    return (
        <div className="flex h-full flex-col min-w-0">
            <header className="flex items-center justify-between border-b border-gray-200 px-6 h-16 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-gray-800">grid_view</span>
                    <h2 className="text-lg font-bold">Proyecto {idProyecto} - Tablero Kanban</h2>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#fcf8fa]">
                <DndContext 
                    collisionDetection={closestCorners} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-6 items-start">
                        <KanbanColumn
                            id="PENDIENTE"
                            titulo="Pendiente"
                            tareas={tareasPendientes}
                            onAddTask={(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') ? () => setIsTaskModalOpen(true) : null}
                        />
                        <KanbanColumn id="EN_PROGRESO" titulo="En Progreso" tareas={tareasEnProgreso} />
                        <KanbanColumn id="COMPLETADO" titulo="Completado" tareas={tareasCompletadas} />
                    </div>
                    
                    <DragOverlay>
                        {activeTask ? <TaskCard tarea={activeTask} isOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Modal Nueva Tarea */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Tarea</h2>

                        <form onSubmit={handleCrearTarea} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej. Integrar pasarela de pago"
                                    value={nuevaTarea.titulo}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Detalles de la tarea..."
                                    value={nuevaTarea.descripcion}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={nuevaTarea.prioridad}
                                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}
                                >
                                    <option value="ALTA">Alta</option>
                                    <option value="MEDIA">Media</option>
                                    <option value="BAJA">Baja</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Crear Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
