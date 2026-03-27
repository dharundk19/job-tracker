import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import useJobStore from '../store/useJobStore';
import Navbar from '../components/Navbar';
import KanbanBoard from '../components/KanbanBoard';
import JobCard from '../components/JobCard';
import AddJobModal from '../components/AddJobModal';
import Analytics from '../components/Analytics';
import ReminderForm from '../components/ReminderForm';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'applied', 'interview', 'offer', 'rejected'];

export default function Dashboard() {
  const { user } = useAuth();
  const { jobs, loading, fetchJobs, filters, setFilters, syncJobUpdate, syncJobDelete } = useJobStore();

  const [activeTab, setActiveTab] = useState('Board');
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  // Socket.IO real-time sync
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join', user._id);

    socket.on('job:updated', (job) => {
      syncJobUpdate(job);
      toast('Job updated in another tab', { icon: '🔄' });
    });
    socket.on('job:created', (job) => {
      fetchJobs();
    });
    socket.on('job:deleted', (id) => {
      syncJobDelete(id);
    });

    return () => socket.disconnect();
  }, [user._id]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleEdit = (job) => {
    setEditJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditJob(null);
  };

  const counts = {
    applied: jobs.filter((j) => j.status === 'applied').length,
    interview: jobs.filter((j) => j.status === 'interview').length,
    offer: jobs.filter((j) => j.status === 'offer').length,
    rejected: jobs.filter((j) => j.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} tracked
              {counts.interview > 0 && ` · ${counts.interview} interview${counts.interview > 1 ? 's' : ''}`}
              {counts.offer > 0 && ` · 🎉 ${counts.offer} offer${counts.offer > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="text-lg">+</span> Add Job
          </button>
        </div>

        {/* Search & Filter bar — show on Board and List tabs */}
        {(activeTab === 'Board' || activeTab === 'List') && (
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              className="input max-w-xs"
              placeholder="🔍 Search company or role..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <select
              className="input w-40"
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}
                </option>
              ))}
            </select>
            <select
              className="input w-36"
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ search: '', status: '' })}
                className="btn-secondary text-sm"
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* TAB: Board */}
        {!loading && activeTab === 'Board' && (
          <KanbanBoard onEdit={handleEdit} />
        )}

        {/* TAB: List */}
        {!loading && activeTab === 'List' && (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">No jobs found.</p>
                <p className="text-gray-600 text-sm mt-1">
                  {filters.search || filters.status
                    ? 'Try clearing your filters.'
                    : 'Click "Add Job" to get started!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'Analytics' && <Analytics />}

        {/* TAB: Reminders */}
        {activeTab === 'Reminders' && <ReminderForm />}
      </div>

      {/* Modal */}
      {showModal && (
        <AddJobModal
          onClose={handleCloseModal}
          editJob={editJob}
        />
      )}
    </div>
  );
}
