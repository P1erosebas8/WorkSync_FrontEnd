import React from 'react';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';

export default function KanbanColumn({ id, titulo, tareas, onAddTask }) {
    const { isOver, setNodeRef } = useDroppable({ id: id });

    return (
        <div className="w-[320px] max-w-[360px] flex flex-col h-full shrink-0">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{titulo}</h3>
                    <span className="bg-gray-200 px-2 py-0.5 rounded-full text-[11px] font-bold text-gray-700">
                        {tareas.length}
                    </span>
                </div>
                <button className="text-gray-400 hover:text-gray-700">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
            </div>
            
            <div 
                ref={setNodeRef}
                className={`flex-1 flex flex-col gap-3 overflow-y-auto pb-6 rounded-xl transition-colors ${isOver ? 'bg-blue-50/50 outline-dashed outline-2 outline-blue-300' : ''}`}
            >
                {tareas.length > 0 ? (
                    tareas.map(tarea => <TaskCard key={tarea.idTarea} tarea={tarea} />)
                ) : (
                    <div className="h-32 w-full rounded-xl flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">Sin tareas</p>
                    </div>
                )}
                
                {onAddTask && (
                    <button 
                        onClick={onAddTask}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors font-medium text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nueva Tarea
                    </button>
                )}
            </div>
        </div>
    );
}
