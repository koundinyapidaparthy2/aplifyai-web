import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Job } from '@/types/firestore';
import { Calendar, Building2, MapPin, MoreHorizontal } from 'lucide-react';

interface JobCardProps {
    job: Job;
    index: number;
    onDelete: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, index, onDelete }) => {
    return (
        <Draggable draggableId={job.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 rotate-2' : ''
                        }`}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{job.jobTitle}</h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Building2 className="w-3 h-3 mr-1" />
                                <span className="truncate">{job.companyName}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(job.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        {job.location && (
                            <div className="flex items-center text-xs text-gray-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[80px]">{job.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default JobCard;
