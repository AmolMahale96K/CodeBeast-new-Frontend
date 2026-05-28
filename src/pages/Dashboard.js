import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiAcademicCap, HiCheckCircle, HiXCircle, HiClock, HiFire, HiTrendingUp } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await dashboardAPI.getDashboard();
        setData(d);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center text-dark-500 mt-20">Failed to load dashboard</p>;

  const { stats, recentActivity, dailyActivity, user: dashUser } = data;

  const difficultyData = [
    { name: 'Easy', solved: dashUser.easySolved || 0, fill: '#10b981' },
    { name: 'Medium', solved: dashUser.mediumSolved || 0, fill: '#f59e0b' },
    { name: 'Hard', solved: dashUser.hardSolved || 0, fill: '#ef4444' },
  ];

  const pieData = [
    { name: 'Accepted', value: stats.Accepted || 0 },
    { name: 'Wrong Answer', value: stats['Wrong Answer'] || 0 },
    { name: 'TLE', value: stats['Time Limit Exceeded'] || 0 },
    { name: 'Error', value: (stats['Runtime Error'] || 0) + (stats['Compilation Error'] || 0) },
  ];

  const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

  const statCards = [
    { icon: HiAcademicCap, label: 'Problems Solved', value: dashUser.problemsSolved || 0, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: HiFire, label: 'Score', value: dashUser.score || 0, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: HiTrendingUp, label: 'Rank', value: `#${dashUser.rank || '-'}`, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { icon: HiClock, label: 'Submissions', value: stats.totalSubmissions || 0, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-dark-500 dark:text-dark-400">{label}</p>
                <p className="text-xl font-bold text-dark-900 dark:text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Difficulty breakdown */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Problems by Difficulty</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="solved" radius={[8, 8, 0, 0]}>
                {difficultyData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Submission stats */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Submission Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-dark-500 dark:text-dark-400">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-dark-400 dark:text-dark-500 py-4">No recent activity. Start solving problems!</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    {activity.status === 'Accepted' ? (
                      <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <HiXCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{activity.problem}</p>
                      <p className="text-xs text-dark-400 dark:text-dark-500">{activity.language} • {new Date(activity.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`badge ${activity.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>{activity.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;