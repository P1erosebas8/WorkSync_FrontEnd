const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getComentariosByTarea = async (taskId) => {
    const response = await fetch(`${API_URL}/comentarios/tarea/${taskId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar comentarios');
    return response.json();
};

export const createComentario = async (comentarioData) => {
    const response = await fetch(`${API_URL}/comentarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(comentarioData)
    });
    if (!response.ok) throw new Error('Error al crear comentario');
    return response.json();
};
