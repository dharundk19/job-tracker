import { useState } from 'react';
import useJobStore from '../store/useJobStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  interview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  offer: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_EMOJI = {
  applied: '📤',
  interview: '🗣️',
  offer: '🎉',
  rejected: '❌',
};

export default function JobCard({ job, onEdit, isDragging = false }) {
  const { deleteJob } = useJobStore();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete ${job.company} – ${job.role}?`)) return;
    setDeleting(true);
    try {
      await deleteJob(job._id);
      toast.success('Job removed');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`card cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-xl ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{job.company}</h3>
          <p className="text-gray-400 text-xs truncate mt-0.5">{job.role}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_COLORS[job.status]}`}
        >
          {STATUS_EMOJI[job.status]} {job.status}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        {job.location && <span>📍 {job.location}</span>}
        {job.salary && <span>💰 {job.salary}</span>}
        <span>🕐 {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
      </div>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-xs text-gray-600">+{job.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Notes preview */}
      {job.notes && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">"{job.notes}"</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-800 pt-2 mt-1">
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            🔗 Link
          </a>
        )}
        {job.resumeUrl && (
          <a
            href={job.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-green-400 hover:text-green-300 transition"
          >
            📄 Resume
          </a>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(job); }}
            className="text-xs text-gray-400 hover:text-white transition"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
