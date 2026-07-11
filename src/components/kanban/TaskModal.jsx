import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getComentariosByTarea, createComentario } from '../../services/comentarioService';
import { getEvidenciasByTarea, uploadEvidencia, descargarEvidencia } from '../../services/evidenciaService';

export default function TaskModal({ tarea, allTasks = [], onClose, colaboradores = [], onReassign, onUpdateTask }) {
    const [activeTab, setActiveTab] = useState('comentarios');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: tarea.title,
        description: tarea.description,
        priority: tarea.priority,
        dependsOnTaskId: tarea.dependsOnTaskId || '',
        dueDate: tarea.dueDate || ''
    });

    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [evidencias, setEvidencias] = useState([]);
    const [loadingEvidencias, setLoadingEvidencias] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('jwt_token');
    let idUsuarioActual = null;
    let nombreUsuarioActual = '';
    let isAdmin = false;
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            idUsuarioActual = decodedPayload.userId;
            nombreUsuarioActual = decodedPayload.name || decodedPayload.sub;
            if (decodedPayload.roles && decodedPayload.roles.length > 0) {
                const role = decodedPayload.roles[0].authority || decodedPayload.roles[0];
                isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
            }
        } catch (e) {
            console.error("Error decodificando token en TaskModal", e);
        }
    }

    const canInteract = isAdmin || tarea.assigneeId === idUsuarioActual;
    const commentsEndRef = useRef(null);

    useEffect(() => {
        cargarComentarios();
        cargarEvidencias();
        cargarHistorial();
    }, [tarea.taskId]);

    const cargarHistorial = async () => {
        setLoadingHistorial(true);
        try {
            const { getHistorialTarea } = await import('../../services/tareaService');
            const data = await getHistorialTarea(tarea.taskId);
            setHistorial(data);
        } catch (err) {
            console.error("Error al cargar historial", err);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const cargarComentarios = () => {
        setLoadingComentarios(true);
        getComentariosByTarea(tarea.taskId)
            .then(data => {
                const sorted = data.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
                setComentarios(sorted);
                scrollToBottom();
            })
            .catch(err => toast.error("Error al cargar comentarios"))
            .finally(() => setLoadingComentarios(false));
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const cargarEvidencias = () => {
        setLoadingEvidencias(true);
        getEvidenciasByTarea(tarea.taskId)
            .then(data => setEvidencias(data))
            .catch(err => toast.error("Error al cargar evidencias"))
            .finally(() => setLoadingEvidencias(false));
    };

    const handleCrearComentario = (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        if (!idUsuarioActual) return toast.error("Usuario no identificado");

        createComentario({
            content: nuevoComentario,
            taskId: tarea.taskId,
            userId: idUsuarioActual
        }).then(data => {
            setComentarios([...comentarios, data]);
            setNuevoComentario('');
            toast.success("Comentario añadido");
            scrollToBottom();
        }).catch(err => toast.error("Error al añadir comentario"));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!idUsuarioActual) return toast.error("Usuario no identificado");

        setIsUploading(true);
        uploadEvidencia(tarea.taskId, idUsuarioActual, file)
            .then(data => {
                setEvidencias([data, ...evidencias]);
                toast.success("Archivo subido correctamente");
            })
            .catch(err => toast.error("Error al subir archivo"))
            .finally(() => {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            });
    };

    const handleDownload = async (e, ev) => {
        e.preventDefault();
        if (ev.downloadUrl) {
            try {
                const response = await fetch(ev.downloadUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = ev.fileName || 'descarga';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (err) {
                console.error('Error al descargar:', err);
                window.open(ev.downloadUrl, '_blank');
            }
        } else {
            toast.error("El archivo no tiene una URL válida");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-[#1a1a1a] rounded-xl w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-800 shrink-0">
                    <div className="flex-1 pr-4">
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full bg-[#121212] border border-gray-700 text-white rounded px-2 py-1 text-xl font-bold outline-none mb-2 focus:border-red-500"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-white mb-2">{tarea.title}</h2>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-3 items-center">
                            {isEditing ? (
                                <select
                                    className="bg-[#121212] border border-gray-700 text-white rounded px-1 outline-none"
                                    value={editForm.priority}
                                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                >
                                    <option value="ALTA">Alta</option>
                                    <option value="MEDIA">Media</option>
                                    <option value="BAJA">Baja</option>
                                </select>
                            ) : (
                                <span className="uppercase bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-medium">{tarea.priority}</span>
                            )}
                            <span className="uppercase bg-red-900/30 text-red-400 px-2 py-0.5 rounded font-medium">{tarea.status}</span>
                            <span className="flex items-center gap-1">
                                Asignado a:
                                {isAdmin && onReassign && !isEditing ? (
                                    <select
                                        className="bg-[#121212] border border-gray-700 text-white text-xs rounded px-1 outline-none"
                                        value={tarea.assigneeId || ''}
                                        onChange={(e) => onReassign(tarea.taskId, e.target.value)}
                                    >
                                        <option value="">Nadie</option>
                                        {colaboradores.filter(u => u != null).map(u => (
                                            <option key={u.userId} value={u.userId}>{u.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-white">{tarea.assigneeName || 'Nadie'}</span>
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {canInteract && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Body - Descripción estática o editable */}
                <div className="p-6 border-b border-gray-800 bg-[#121212] shrink-0">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Descripción</h3>
                    {isEditing ? (
                        <textarea
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 rounded p-2 text-sm outline-none focus:border-red-500 resize-none"
                            rows="4"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        ></textarea>
                    ) : (
                        <p className="text-gray-400 text-sm whitespace-pre-wrap">{tarea.description}</p>
                    )}

                    {isEditing && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Depende de (Opcional)</h3>
                            <select
                                className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded p-2 text-sm outline-none"
                                value={editForm.dependsOnTaskId}
                                onChange={(e) => setEditForm({...editForm, dependsOnTaskId: e.target.value})}
                            >
                                <option value="">Ninguna dependencia</option>
                                {allTasks.filter(t => t.taskId !== tarea.taskId).map(t => (
                                    <option key={t.taskId} value={t.taskId}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {isEditing && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Fecha de Vencimiento</h3>
                            <input
                                type="date"
                                className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded p-2 text-sm outline-none [color-scheme:dark]"
                                value={editForm.dueDate}
                                onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                            />
                        </div>
                    )}
                    
                    {!isEditing && tarea.dependsOnTaskId && (
                        <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-[18px]">link</span>
                            <span className="text-xs text-gray-400">Depende de: </span>
                            <span className="text-sm font-semibold text-red-400">
                                {allTasks.find(t => t.taskId === parseInt(tarea.dependsOnTaskId))?.title || 'Tarea Desconocida'}
                            </span>
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex gap-2 mt-4 justify-end">
                            <button 
                                onClick={() => {
                                    setEditForm({
                                        title: tarea.title,
                                        description: tarea.description,
                                        priority: tarea.priority,
                                        dependsOnTaskId: tarea.dependsOnTaskId || '',
                                        dueDate: tarea.dueDate || ''
                                    });
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                            >Cancelar</button>
                            <button 
                                onClick={() => {
                                    if(onUpdateTask) {
                                        onUpdateTask(tarea.taskId, {
                                            title: editForm.title,
                                            description: editForm.description,
                                            priority: editForm.priority,
                                            dependsOnTaskId: editForm.dependsOnTaskId ? parseInt(editForm.dependsOnTaskId) : null,
                                            dueDate: editForm.dueDate || null
                                        });
                                        setIsEditing(false);
                                    }
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >Guardar Cambios</button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 px-6 shrink-0 pt-2 bg-[#121212]">
                    <button
                        onClick={() => setActiveTab('comentarios')}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comentarios' ? 'border-red-600 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="material-symbols-outlined text-sm">forum</span>
                        Comentarios ({comentarios.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('evidencias')}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'evidencias' ? 'border-red-600 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="material-symbols-outlined text-sm">attach_file</span>
                        Evidencias ({evidencias.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('historial')}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'historial' ? 'border-red-600 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="material-symbols-outlined text-sm">history</span>
                        Historial
                    </button>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#1a1a1a]">
                    {activeTab === 'comentarios' ? (
                        <div className="space-y-4">
                            {loadingComentarios ? (
                                <div className="text-center text-sm text-gray-500">Cargando...</div>
                            ) : comentarios.length === 0 ? (
                                <div className="text-center text-sm text-gray-500 py-10">Sin comentarios aún.</div>
                            ) : (
                                comentarios.map(com => (
                                    <div key={com.commentId} className={`flex gap-3 ${com.userId === idUsuarioActual ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0" title={com.userName}>
                                            {com.userName ? com.userName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className={`flex flex-col max-w-[75%] ${com.userId === idUsuarioActual ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-gray-500 mb-1">
                                                {com.userName} • {new Date(com.creationDate).toLocaleString()}
                                            </span>
                                            <div className={`p-3 rounded-lg text-sm ${com.userId === idUsuarioActual ? 'bg-red-600 text-white rounded-tr-none' : 'bg-[#242424] text-gray-200 rounded-tl-none'}`}>
                                                {com.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentsEndRef} />
                        </div>
                    ) : activeTab === 'evidencias' ? (
                        <div className="space-y-4">
                            {canInteract && (
                                <div className="flex justify-between items-center bg-red-900/20 p-4 rounded-lg border border-red-900/50">
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-400">Subir nueva evidencia</h4>
                                        <p className="text-xs text-red-500 mt-1">Adjunta un documento o imagen como prueba del trabajo.</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">{isUploading ? 'hourglass_empty' : 'upload'}</span>
                                        {isUploading ? 'Subiendo...' : 'Examinar'}
                                    </button>
                                </div>
                            )}

                            {loadingEvidencias ? (
                                <div className="text-center text-sm text-gray-500 mt-4">Cargando...</div>
                            ) : evidencias.length === 0 ? (
                                <div className="text-center text-sm text-gray-500 py-10">No hay archivos adjuntos.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    {evidencias.map(ev => (
                                        <div key={ev.evidenceId} className="flex items-start gap-3 p-3 border border-gray-800 bg-[#242424] rounded-lg hover:border-red-500/50 transition-colors">
                                            <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-gray-500">
                                                    {ev.mimeType.includes('image') ? 'image' : 'description'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => handleDownload(e, ev)}>
                                                <span className="text-sm font-medium text-red-600 hover:underline truncate block">
                                                    {ev.fileName}
                                                </span>
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    Subido por {ev.userName} el {new Date(ev.uploadDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button onClick={(e) => handleDownload(e, ev)} className="text-gray-400 hover:text-red-600 shrink-0" title="Descargar">
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'historial' ? (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                        {loadingHistorial ? (
                            <div className="text-center text-sm text-gray-500 relative z-10">Cargando...</div>
                        ) : historial.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-10 relative z-10">Sin registros de auditoría.</div>
                        ) : (
                            historial.map((h, i) => (
                                <div key={h.historyId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-800 bg-[#1a1a1a] text-gray-500 group-hover:text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <span className="material-symbols-outlined text-[18px]">
                                            {h.changeDetail.includes("Reasignación") ? 'person_swap' : 'swap_horiz'}
                                        </span>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-800 bg-[#242424] shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-gray-300 text-sm">{h.changeDetail}</div>
                                            <div className="text-[10px] text-gray-500">{new Date(h.changeDate).toLocaleString()}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                            <span className="bg-gray-800 px-2 py-0.5 rounded">{h.oldStatus}</span>
                                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                            <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded">{h.newStatus}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">person</span>
                                            Modificado por: {h.userName}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    ) : null}
                </div>

                {activeTab === 'comentarios' && canInteract && (
                    <div className="p-4 bg-[#121212] border-t border-gray-800 shrink-0">
                        <form onSubmit={handleCrearComentario} className="flex gap-3">
                            <input
                                type="text"
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-800 text-white rounded-full focus:ring-2 focus:ring-red-500/50 outline-none text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!nuevoComentario.trim()}
                                className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0"
                            >
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
