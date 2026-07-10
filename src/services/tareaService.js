const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const obtenerTareasProyecto = async (projectId) => {
    const response = await fetch(`${API_URL}/tareas/proyecto/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión expirada o no autorizada');
    }
    if (!response.ok) throw new Error('Error al cargar tareas');

    return response.json();
};

export const actualizarEstadoTarea = async (taskId, nuevoEstado) => {
    const response = await fetch(`${API_URL}/tareas/${taskId}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error actualizando estado');

    return response;
};

export const crearTarea = async (nuevaTarea, projectId) => {
    const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...nuevaTarea,
            status: 'PENDIENTE',
            projectId: parseInt(projectId)
        })
    });

    if (!response.ok) throw new Error('Error al guardar la tarea');

    return response.json();
};
