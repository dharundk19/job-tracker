import { useState } from 'react';
import useJobStore from '../store/useJobStore';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['applied', 'interview', 'offer', 'rejected'];

const emptyForm = {
  company: '',
  role: '',
  status: 'applied',
  location: '',
  salary: '',
  jobUrl: '',
  notes: '',
  tags: '',
};

export default function AddJobModal({ onClose, editJob = null }) {
  const { addJob, updateJob } = useJobStore();
  const [form, setForm] = useState(
    editJob
      ? { ...editJob, tags: editJob.tags?.join(', ') || '' }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.role) {
      toast.error('Company and Role are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      if (editJob) {
        await updateJob(editJob._id, payload);
        toast.success('Job updated!');
      } else {
        await addJob(payload);
        toast.success('Job added!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      {type === 'textarea' ? (
        <textarea
          className="input resize-none h-20"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ) : (
        <input
          type={type}
          className="input"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            {editJob ? '✏️ Edit Job' : '➕ Add New Job'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('Company *', 'company', 'text', 'Google, Meta, Stripe...')}
            {field('Role *', 'role', 'text', 'Frontend Engineer...')}
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Location', 'location', 'text', 'Remote, NYC...')}
            {field('Salary', 'salary', 'text', '$120k, ₹15 LPA...')}
          </div>

          {field('Job URL', 'jobUrl', 'url', 'https://...')}
          {field('Tags (comma separated)', 'tags', 'text', 'react, remote, startup')}
          {field('Notes', 'notes', 'textarea', 'Recruiter name, prep notes...')}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : editJob ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
