const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const obtenerProyectos = async () => {
    const response = await fetch(`${API_URL}/proyectos`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado');
    }
    if (!response.ok) throw new Error('Error al cargar proyectos');

    return response.json();
};

export const obtenerUsuarios = async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error obteniendo usuarios');

    return response.json();
};

export const crearProyecto = async (nuevoProyecto) => {
    const response = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevoProyecto)
    });

    if (!response.ok) throw new Error('Error al crear el proyecto');

    return response.json();
};

export const asignarUsuario = async (userId, projectId) => {
    const response = await fetch(`${API_URL}/asignaciones`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, projectId })
    });

    if (!response.ok) throw new Error('Error al asignar usuario');

    return response;
};

export const obtenerAsignacionesProyecto = async (projectId) => {
    const response = await fetch(`${API_URL}/asignaciones/proyecto/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al obtener asignaciones');

    return response.json();
};

export const actualizarProyecto = async (projectId, proyectoData) => {
    const response = await fetch(`${API_URL}/proyectos/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(proyectoData)
    });

    if (!response.ok) throw new Error('Error al actualizar el proyecto');

    return response.json();
};

export const archivarProyecto = async (projectId) => {
    const response = await fetch(`${API_URL}/proyectos/${projectId}/archivar`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al cambiar el estado del proyecto');

    return response.json();
};

export const obtenerMetricasProyecto = async (projectId) => {
    const response = await fetch(`${API_URL}/proyectos/${projectId}/metricas`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al obtener métricas');

    return response.json();
};

export const obtenerMetricasGlobales = async () => {
    const response = await fetch(`${API_URL}/proyectos/metricas/globales`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al obtener métricas globales');

    return response.json();
};
