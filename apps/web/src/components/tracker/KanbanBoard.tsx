'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Job } from '@/types/firestore';
import JobCard from './JobCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
    jobs: Job[];
    onUpdateStatus: (jobId: string, newStatus: string) => void;
    onDeleteJob: (jobId: string) => void;
    onAddJob: (status: string) => void;
}

const COLUMNS = [
    { id: 'interested', title: 'Wishlist', color: 'bg-gray-100' },
    { id: 'applied', title: 'Applied', color: 'bg-blue-50' },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-50' },
    { id: 'offered', title: 'Offer', color: 'bg-green-50' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-50' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobs, onUpdateStatus, onDeleteJob, onAddJob }) => {
    const [columns, setColumns] = useState<{ [key: string]: Job[] }>({});

    useEffect(() => {
        const newColumns: { [key: string]: Job[] } = {};
        COLUMNS.forEach(col => {
            newColumns[col.id] = jobs.filter(job => {
                // Normalize status mapping if needed
                if (col.id === 'interviewing' && (job.status === 'interview' || job.status === 'interviewing')) return true;
                if (col.id === 'offered' && (job.status === 'offer' || job.status === 'offered')) return true;
                return job.status === col.id;
            });
        });
        setColumns(newColumns);
    }, [jobs]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const sourceColumnId = source.droppableId;
        const destColumnId = destination.droppableId;

        // Optimistic update
        const sourceItems = Array.from(columns[sourceColumnId]);
        const destItems = sourceColumnId === destColumnId ? sourceItems : Array.from(columns[destColumnId]);

        const [removed] = sourceItems.splice(source.index, 1);

        if (sourceColumnId === destColumnId) {
            sourceItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [sourceColumnId]: sourceItems,
            });
        } else {
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [sourceColumnId]: sourceItems,
                [destColumnId]: destItems,
            });

            // Trigger update
            onUpdateStatus(draggableId, destColumnId);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full overflow-x-auto pb-4 gap-6">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50/50 border border-gray-200/60">
                        <div className={`p-4 flex items-center justify-between border-b border-gray-100 ${column.color} rounded-t-xl bg-opacity-50`}>
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-gray-700 text-sm">{column.title}</h2>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
                                    {columns[column.id]?.length || 0}
                                </span>
                            </div>
                            <button
                                onClick={() => onAddJob(column.id)}
                                className="text-gray-400 hover:text-gray-700 hover:bg-white/50 p-1 rounded-md transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100/50' : ''
                                        }`}
                                >
                                    {columns[column.id]?.map((job, index) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            index={index}
                                            onDelete={onDeleteJob}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;
