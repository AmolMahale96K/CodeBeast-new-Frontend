import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiUsers, HiAcademicCap, HiClipboardList, HiTrendingUp } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: d } = await dashboardAPI.getAdminAnalytics();
        setData(d);
      } catch (err) {
        console.error('Admin analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center text-dark-500 mt-20">Failed to load analytics</p>;

  const { counts, topUsers, difficultyBreakdown, submissionTrend } = data;

  const statCards = [
    { icon: HiUsers, label: 'Total Users', value: counts?.users || 0, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: HiAcademicCap, label: 'Total Problems', value: counts?.problems || 0, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: HiClipboardList, label: 'Total Submissions', value: counts?.submissions || 0, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { icon: HiTrendingUp, label: 'Assignments', value: counts?.assignments || 0, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  const difficultyChart = [
    { name: 'Easy', count: difficultyBreakdown?.Easy || 0, fill: '#10b981' },
    { name: 'Medium', count: difficultyBreakdown?.Medium || 0, fill: '#f59e0b' },
    { name: 'Hard', count: difficultyBreakdown?.Hard || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Admin Panel</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Platform analytics and management</p>
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Problems by Difficulty</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={difficultyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {difficultyChart.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Submission Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={submissionTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">#</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Problems Solved</th>
                </tr>
              </thead>
              <tbody>
                {(topUsers || []).map((u, i) => (
                  <tr key={u._id} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-3 px-4 text-dark-600 dark:text-dark-400">{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-dark-800 dark:text-dark-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-dark-500 dark:text-dark-400">{u.email}</td>
                    <td className="py-3 px-4 font-semibold text-dark-800 dark:text-dark-200">{u.score}</td>
                    <td className="py-3 px-4 text-dark-600 dark:text-dark-400">{u.problemsSolved}</td>
                  </tr>
                ))}
                {(!topUsers || topUsers.length === 0) && (
                  <tr><td colSpan="5" className="py-8 text-center text-dark-400 dark:text-dark-500">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;