import React, { useEffect, useState } from 'react';
import { obtenerMetricasProyecto } from '../../services/proyectoService';

export default function MetricsModal({ projectId, onClose }) {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerMetricasProyecto(projectId)
            .then(data => {
                setMetrics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando métricas:", err);
                setLoading(false);
            });
    }, [projectId]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">monitoring</span>
                        Métricas del Proyecto
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Calculando desempeño...</div>
                ) : metrics ? (
                    <div className="space-y-6">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 text-center">
                                <div className="text-3xl font-bold text-gray-100">{metrics.totalTasks}</div>
                                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Total Tareas</div>
                            </div>
                            <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 text-center">
                                <div className="text-3xl font-bold text-green-500">{metrics.completedTasks}</div>
                                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Completadas</div>
                            </div>
                            <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 text-center">
                                <div className="text-3xl font-bold text-amber-500">{metrics.inProgressTasks}</div>
                                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">En Proceso</div>
                            </div>
                        </div>

                        {/* Performance Details */}
                        <div className="bg-[#242424] p-5 rounded-lg border border-gray-800">
                            <h3 className="text-gray-300 font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                Cumplimiento de Plazos
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Tareas Atrasadas</span>
                                <span className="font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded">{metrics.overdueTasks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Tareas a Tiempo (Completadas)</span>
                                <span className="font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded">{metrics.onTimeTasks}</span>
                            </div>
                        </div>

                        {/* Efficiency Bar */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-gray-300">Eficiencia Global</span>
                                <span className="text-xl font-bold text-white">{metrics.efficiencyPercentage}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-600 to-green-500 transition-all duration-1000" 
                                    style={{ width: `${metrics.efficiencyPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {metrics.efficiencyPercentage === 100 ? '¡Excelente trabajo! Todo al día.' : 
                                 metrics.efficiencyPercentage > 50 ? 'Buen progreso, sigan así.' : 
                                 'Hay oportunidad de mejorar la velocidad del equipo.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-red-400 py-10">Error al cargar métricas.</div>
                )}
            </div>
        </div>
    );
}
