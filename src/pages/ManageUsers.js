import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiShieldCheck, HiShieldExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getUsers();
      setUsers(data.users || data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await dashboardAPI.updateUserRole(user._id, newRole);
      toast.success(`${user.name} is now ${newRole}`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  if (!isAdmin) return <p className="text-center text-dark-500 mt-20">Access denied</p>;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Manage Users</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Institution</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Score</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Problems</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Role</th>
                <th className="text-right py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50">
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
                  <td className="py-3 px-4 text-dark-500 dark:text-dark-400">{u.institution || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-dark-800 dark:text-dark-200">{u.score || 0}</td>
                  <td className="py-3 px-4 text-dark-600 dark:text-dark-400">
                    <span className="text-emerald-600 dark:text-emerald-400">{u.easySolved || 0}E</span>
                    {' / '}
                    <span className="text-amber-600 dark:text-amber-400">{u.mediumSolved || 0}M</span>
                    {' / '}
                    <span className="text-red-600 dark:text-red-400">{u.hardSolved || 0}H</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.role === 'admin' ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400' : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => toggleRole(u)}
                      className={`btn-ghost p-1.5 ${u.role === 'admin' ? 'text-red-500 hover:text-red-600' : 'text-primary-500 hover:text-primary-600'}`}
                      title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}>
                      {u.role === 'admin' ? <HiShieldExclamation className="w-4 h-4" /> : <HiShieldCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-dark-400 dark:text-dark-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;