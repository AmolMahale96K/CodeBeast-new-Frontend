import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiStar } from 'react-icons/hi';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getLeaderboard()
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const getRankIcon = (rank) => {
    if (rank === 1) return <HiStar className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <HiStar className="w-6 h-6 text-dark-300 dark:text-dark-500" />;
    if (rank === 3) return <HiStar className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-dark-400">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Leaderboard</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Top coders ranked by score</p>
      </div>

      <div className="card overflow-hidden">
        {/* Top 3 */}
        {users.slice(0, 3).length > 0 && (
          <div className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-b border-dark-200 dark:border-dark-700">
            <div className="flex justify-center items-end gap-4 md:gap-8">
              {users.slice(0, 3).reverse().map((u) => (
                <div key={u._id} className={`text-center ${users[0]._id === u._id ? 'order-1' : ''} ${u.rank === 2 ? 'order-0' : ''}`}>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white ${u.rank === 1 ? 'bg-amber-400 w-20 h-20' : u.rank === 2 ? 'bg-dark-400 w-18 h-18' : 'bg-amber-700'}`}>
                    {u.rank}
                  </div>
                  <p className="text-sm font-semibold mt-2 text-dark-800 dark:text-dark-200 truncate max-w-[80px]">{u.name}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">{u.score} pts</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase w-16">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden sm:table-cell">Solved</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden md:table-cell">Easy</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden md:table-cell">Medium</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden md:table-cell">Hard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30">
                  <td className="px-4 py-3">{getRankIcon(u.rank)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{u.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-dark-800 dark:text-dark-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 dark:text-primary-400">
                      <HiStar className="w-4 h-4" /> {u.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-dark-600 dark:text-dark-400 hidden sm:table-cell">{u.problemsSolved || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-emerald-600 hidden md:table-cell">{u.easySolved || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-amber-600 hidden md:table-cell">{u.mediumSolved || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600 hidden md:table-cell">{u.hardSolved || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;