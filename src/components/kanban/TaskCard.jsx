import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ tarea, isOverlay }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: tarea.idTarea,
        data: { tarea },
        disabled: isOverlay
    });

    const style = {
        opacity: isDragging && !isOverlay ? 0.3 : 1,
    };

    const prioridadColor = {
        'ALTA': 'bg-red-100 text-red-700 border-red-200',
        'MEDIA': 'bg-amber-100 text-amber-700 border-amber-200',
        'BAJA': 'bg-green-100 text-green-700 border-green-200'
    };

    const colorClass = prioridadColor[tarea.prioridad] || prioridadColor.MEDIA;

    return (
        <div
            ref={setNodeRef} style={style} {...(isOverlay ? {} : listeners)} {...(isOverlay ? {} : attributes)}
            className={`bg-white p-4 rounded-xl border ${isDragging || isOverlay ? 'border-blue-500 shadow-xl scale-105 cursor-grabbing' : 'border-gray-200 shadow-sm cursor-grab'} hover:shadow-md transition-all group`}
        >
            <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${colorClass}`}>
                    {tarea.prioridad}
                </span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm text-gray-400 hover:text-gray-600">edit</span>
                </button>
            </div>
            <h4 className="text-[14px] font-semibold text-gray-900 mb-2">{tarea.titulo}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{tarea.descripcion}</p>
            <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        U
                    </div>
                </div>
            </div>
        </div>
    );
}
