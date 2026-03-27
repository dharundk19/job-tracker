import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useJobStore from '../store/useJobStore';
import JobCard from './JobCard';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'applied', label: 'Applied', emoji: '📤', color: 'border-blue-500/40' },
  { id: 'interview', label: 'Interview', emoji: '🗣️', color: 'border-yellow-500/40' },
  { id: 'offer', label: 'Offer', emoji: '🎉', color: 'border-green-500/40' },
  { id: 'rejected', label: 'Rejected', emoji: '❌', color: 'border-red-500/40' },
];

function SortableJobCard({ job, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard job={job} onEdit={onEdit} isDragging={isDragging} />
    </div>
  );
}

function Column({ column, jobs, onEdit }) {
  const { setNodeRef } = useSortable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-gray-900/60 rounded-xl border ${column.color} min-h-[200px] w-72 shrink-0`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span>{column.emoji}</span>
          <span className="font-semibold text-white text-sm">{column.label}</span>
        </div>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-medium">
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
        <SortableContext items={jobs.map((j) => j._id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobCard key={job._id} job={job} onEdit={onEdit} />
          ))}
        </SortableContext>
        {jobs.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">Drop jobs here</div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ onEdit }) {
  const { jobs, updateJob } = useJobStore();
  const [activeJob, setActiveJob] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getJobsByStatus = (status) => jobs.filter((j) => j.status === status);

  const handleDragStart = (event) => {
    const job = jobs.find((j) => j._id === event.active.id);
    setActiveJob(job);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const draggedJob = jobs.find((j) => j._id === active.id);
    if (!draggedJob) return;

    // Determine which column was dropped into
    let newStatus = null;
    for (const col of COLUMNS) {
      const colJobs = getJobsByStatus(col.id);
      if (over.id === col.id || colJobs.some((j) => j._id === over.id)) {
        newStatus = col.id;
        break;
      }
    }

    if (!newStatus || newStatus === draggedJob.status) return;

    try {
      await updateJob(draggedJob._id, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            jobs={getJobsByStatus(col.id)}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay>
        {activeJob && (
          <div className="rotate-2 scale-105 opacity-90">
            <JobCard job={activeJob} onEdit={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
