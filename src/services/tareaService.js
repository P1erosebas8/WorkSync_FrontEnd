const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const obtenerTareasProyecto = async (idProyecto) => {
    const response = await fetch(`${API_URL}/tareas/proyecto/${idProyecto}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión expirada o no autorizada');
    }
    if (!response.ok) throw new Error('Error al cargar tareas');

    return response.json();
};

export const actualizarEstadoTarea = async (idTarea, nuevoEstado) => {
    const response = await fetch(`${API_URL}/tareas/${idTarea}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error actualizando estado');

    return response;
};

export const crearTarea = async (nuevaTarea, idProyecto) => {
    const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...nuevaTarea,
            estado: 'PENDIENTE',
            idProyecto: parseInt(idProyecto)
        })
    });

    if (!response.ok) throw new Error('Error al guardar la tarea');

    return response.json();
};
