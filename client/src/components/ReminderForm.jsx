import { useState, useEffect } from 'react';
import api from '../services/api';
import useJobStore from '../store/useJobStore';
import toast from 'react-hot-toast';

export default function ReminderForm() {
  const { jobs } = useJobStore();
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ jobId: '', reminderDate: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    try {
      const { data } = await api.get('/reminders');
      setReminders(data);
    } catch {
      toast.error('Failed to load reminders');
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobId || !form.reminderDate || !form.message) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/reminders', form);
      setReminders((prev) => [...prev, data]);
      setForm({ jobId: '', reminderDate: '', message: '' });
      toast.success('Reminder set! You will receive an email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      toast.success('Reminder deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const upcoming = reminders.filter((r) => !r.sent && new Date(r.reminderDate) >= new Date());
  const past = reminders.filter((r) => r.sent || new Date(r.reminderDate) < new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="card">
        <h3 className="text-white font-semibold text-lg mb-4">⏰ Set a Reminder</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Job</label>
            <select
              className="input"
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
              required
            >
              <option value="">Select a job...</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.company} — {j.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reminder Date & Time</label>
            <input
              type="datetime-local"
              className="input"
              value={form.reminderDate}
              onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="label">Message / Note</label>
            <textarea
              className="input resize-none h-20"
              placeholder="e.g. Follow up with recruiter, Prepare for system design round..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Setting...' : '📧 Set Email Reminder'}
          </button>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {/* Upcoming */}
        <div className="card">
          <h3 className="text-white font-semibold mb-3">Upcoming ({upcoming.length})</h3>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming reminders.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((r) => (
                <div
                  key={r._id}
                  className="flex items-start justify-between gap-3 bg-gray-800/60 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {r.job?.company} — {r.job?.role}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{r.message}</p>
                    <p className="text-indigo-400 text-xs mt-1">
                      📅 {new Date(r.reminderDate).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="text-gray-500 hover:text-red-400 text-sm shrink-0"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div className="card opacity-60">
            <h3 className="text-gray-400 font-semibold mb-3 text-sm">Past / Sent ({past.length})</h3>
            <div className="space-y-2">
              {past.slice(0, 3).map((r) => (
                <div key={r._id} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{r.sent ? '✅' : '⏰'}</span>
                  <span>{r.job?.company} — {r.job?.role}</span>
                  <span className="ml-auto">{new Date(r.reminderDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
