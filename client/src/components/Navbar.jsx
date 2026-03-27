import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const exportPDF = async () => {
    try {
      const response = await api.get('/jobs/export/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs.pdf';
      a.click();
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Export failed');
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get('/jobs/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs.csv';
      a.click();
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Export failed');
    }
  };

  const tabs = ['Board', 'List', 'Analytics', 'Reminders'];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">💼</span>
          <span className="text-xl font-bold text-white">JobTrackr</span>
        </div>

        {/* Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
          >
            ⬇ CSV
          </button>
          <button
            onClick={exportPDF}
            className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
          >
            ⬇ PDF
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm text-gray-300">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm ml-1 transition"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
