import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import useJobStore from '../store/useJobStore';

const STATUS_COLORS = {
  applied: '#3b82f6',
  interview: '#eab308',
  offer: '#22c55e',
  rejected: '#ef4444',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ emoji, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl`}>{emoji}</div>
      <div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-gray-400 text-sm">{label}</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { jobs } = useJobStore();

  if (jobs.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <div className="text-5xl mb-3">📊</div>
        <p>Add some jobs to see your analytics!</p>
      </div>
    );
  }

  // Status breakdown for pie chart
  const statusCounts = ['applied', 'interview', 'offer', 'rejected'].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: jobs.filter((j) => j.status === s).length,
    key: s,
  })).filter((d) => d.value > 0);

  // Applications per month (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = jobs.filter((j) => {
      const jd = new Date(j.createdAt);
      return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
    }).length;
    return { month: MONTHS[d.getMonth()], Applications: count };
  });

  const offerRate = jobs.length
    ? ((jobs.filter((j) => j.status === 'offer').length / jobs.length) * 100).toFixed(0)
    : 0;

  const responseRate = jobs.length
    ? (((jobs.filter((j) => j.status === 'interview' || j.status === 'offer').length) / jobs.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="📤" label="Total Applied" value={jobs.length} color="text-white" />
        <StatCard emoji="🗣️" label="Interviews" value={jobs.filter((j) => j.status === 'interview').length} color="text-yellow-400" />
        <StatCard emoji="🎉" label="Offers" value={jobs.filter((j) => j.status === 'offer').length} color="text-green-400" />
        <StatCard emoji="📈" label="Response Rate" value={`${responseRate}%`} color="text-indigo-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {statusCounts.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
              />
              <Legend formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Applications (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
              />
              <Bar dataKey="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Offer rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Offer Rate</span>
          <span className="text-green-400 font-bold">{offerRate}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${offerRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
