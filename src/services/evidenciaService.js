const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const getEvidenciasByTarea = async (taskId) => {
    const response = await fetch(`${API_URL}/evidencias/tarea/${taskId}`, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Error al cargar evidencias');
    return response.json();
};

export const uploadEvidencia = async (taskId, userId, file) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('userId', userId);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/evidencias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    if (!response.ok) throw new Error('Error al subir evidencia');
    return response.json();
};

export const descargarEvidencia = async (urlDescarga, nombreArchivo) => {
    const response = await fetch(urlDescarga, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al descargar archivo');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
};
