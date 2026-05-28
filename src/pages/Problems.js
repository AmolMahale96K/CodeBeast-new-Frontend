import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiSearch, HiBookmark, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

// const DIFFICULTIES = ['', 'Easy', 'Medium', 'Hard'];
const CATEGORIES = ['', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Math', 'Recursion'];

const Problems = () => {
  const { user, updateUser } = useAuth();
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  const fetchProblems = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (difficulty) params.difficulty = difficulty;
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await problemAPI.getProblems(params);
      setProblems(data.problems);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(1);
  }, [difficulty, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProblems(1);
  };

  const handleBookmark = async (problemId) => {
    try {
      const { data } = await authAPI.toggleBookmark(problemId);
      const updatedUser = { ...user, bookmarks: data.bookmarks };
      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const difficultyBadge = (d) => {
    if (d === 'Easy') return <span className="badge-easy">Easy</span>;
    if (d === 'Medium') return <span className="badge-medium">Medium</span>;
    return <span className="badge-hard">Hard</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Problems</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Browse and solve coding challenges</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <select className="input w-full sm:w-36" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select className="input w-full sm:w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
          <button onClick={() => fetchProblems(1)} className="btn-primary">Filter</button>
        </div>
      </div>

      {/* Problem list */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase w-16">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden md:table-cell">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Difficulty</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden sm:table-cell">Success</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {problems.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-dark-400 dark:text-dark-500">
                      {(pagination.page - 1) * 20 + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/problems/${p.slug}`} className="text-sm font-medium text-dark-800 dark:text-dark-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {p.title}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-center">{difficultyBadge(p.difficulty)}</td>
                    <td className="px-4 py-3 text-center text-sm text-dark-500 dark:text-dark-400 hidden sm:table-cell">
                      {p.submissionsCount > 0 ? `${Math.round((p.acceptedCount / p.submissionsCount) * 100)}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleBookmark(p._id)} className="btn-ghost p-1">
                        <HiBookmark className={`w-4 h-4 ${user?.bookmarks?.includes(p._id) ? 'text-amber-500 fill-amber-500' : 'text-dark-400'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
              <p className="text-xs text-dark-500 dark:text-dark-400">
                Showing {(pagination.page - 1) * 20 + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchProblems(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-ghost p-1.5">
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => fetchProblems(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="btn-ghost p-1.5">
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Problems;