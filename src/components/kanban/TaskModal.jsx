import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getComentariosByTarea, createComentario } from '../../services/comentarioService';
import { getEvidenciasByTarea, uploadEvidencia, descargarEvidencia } from '../../services/evidenciaService';

export default function TaskModal({ tarea, onClose }) {
    const [activeTab, setActiveTab] = useState('comentarios'); // 'comentarios' | 'evidencias'
    
    // Comentarios
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(true);

    // Evidencias
    const [evidencias, setEvidencias] = useState([]);
    const [loadingEvidencias, setLoadingEvidencias] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    // Auth
    const token = localStorage.getItem('jwt_token');
    let idUsuarioActual = null;
    let nombreUsuarioActual = '';
    let isAdmin = false;
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            idUsuarioActual = decodedPayload.idUsuario;
            nombreUsuarioActual = decodedPayload.nombre || decodedPayload.sub;
            if (decodedPayload.roles && decodedPayload.roles.length > 0) {
                const role = decodedPayload.roles[0].authority || decodedPayload.roles[0];
                isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
            }
        } catch(e) {
            console.error("Error decodificando token en TaskModal", e);
        }
    }
    
    const canInteract = isAdmin || tarea.idResponsable === idUsuarioActual;
    const commentsEndRef = useRef(null);

    useEffect(() => {
        cargarComentarios();
        cargarEvidencias();
    }, [tarea.idTarea]);

    const cargarComentarios = () => {
        setLoadingComentarios(true);
        getComentariosByTarea(tarea.idTarea)
            .then(data => {
                // asumiendo que data viene del más reciente al más antiguo o viceversa, aseguramos que el más antiguo sea primero
                // si viene ordenado por fecha desc (más nuevo primero), lo invertimos
                // para que el último esté abajo
                const sorted = data.sort((a,b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
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
        getEvidenciasByTarea(tarea.idTarea)
            .then(data => setEvidencias(data))
            .catch(err => toast.error("Error al cargar evidencias"))
            .finally(() => setLoadingEvidencias(false));
    };

    const handleCrearComentario = (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        if (!idUsuarioActual) return toast.error("Usuario no identificado");

        createComentario({
            contenido: nuevoComentario,
            idTarea: tarea.idTarea,
            idUsuario: idUsuarioActual
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
        uploadEvidencia(tarea.idTarea, idUsuarioActual, file)
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

    const handleDownload = (e, ev) => {
        e.preventDefault();
        if (ev.urlDescarga) {
            window.open(ev.urlDescarga, '_blank');
        } else {
            toast.error("El archivo no tiene una URL válida");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-[#1a1a1a] rounded-xl w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white truncate pr-4">{tarea.titulo}</h2>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                            <span className="uppercase bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-medium">{tarea.prioridad}</span>
                            <span className="uppercase bg-red-900/30 text-red-400 px-2 py-0.5 rounded font-medium">{tarea.estado}</span>
                            <span>Asignado a: {tarea.nombreUsuario || 'Nadie'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
                
                {/* Body - Descripción estática */}
                <div className="p-6 border-b border-gray-800 bg-[#121212] shrink-0">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Descripción</h3>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{tarea.descripcion}</p>
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
                                    <div key={com.idComentario} className={`flex gap-3 ${com.idUsuario === idUsuarioActual ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0" title={com.nombreUsuario}>
                                            {com.nombreUsuario ? com.nombreUsuario.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className={`flex flex-col max-w-[75%] ${com.idUsuario === idUsuarioActual ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-gray-500 mb-1">
                                                {com.nombreUsuario} • {new Date(com.fechaCreacion).toLocaleString()}
                                            </span>
                                            <div className={`p-3 rounded-lg text-sm ${com.idUsuario === idUsuarioActual ? 'bg-red-600 text-white rounded-tr-none' : 'bg-[#242424] text-gray-200 rounded-tl-none'}`}>
                                                {com.contenido}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentsEndRef} />
                        </div>
                    ) : (
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
                                        <div key={ev.idEvidencia} className="flex items-start gap-3 p-3 border border-gray-800 bg-[#242424] rounded-lg hover:border-red-500/50 transition-colors">
                                            <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-gray-500">
                                                    {ev.tipoMime.includes('image') ? 'image' : 'description'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => handleDownload(e, ev)}>
                                                <span className="text-sm font-medium text-red-600 hover:underline truncate block">
                                                    {ev.nombreArchivo}
                                                </span>
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    Subido por {ev.nombreUsuario} el {new Date(ev.fechaSubida).toLocaleDateString()}
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
                    )}
                </div>

                {/* Footer solo para comentarios */}
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
