import React, { useState, useEffect } from 'react';
import { testAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiClock, HiCollection } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    testAPI.getAll()
      .then(({ data }) => setTests(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Tests</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Timed coding tests and assessments</p>
        </div>
        {isAdmin && (
          <Link to="/admin/tests/new" className="btn-primary">Create Test</Link>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="card p-12 text-center">
          <HiCollection className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
          <p className="text-dark-500 dark:text-dark-400">No tests available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((t) => (
            <Link key={t._id} to={`/tests/${t._id}`} className="card hover:shadow-md transition-shadow group">
              <div className="card-body">
                <h3 className="font-semibold text-dark-800 dark:text-dark-200 group-hover:text-primary-600 transition-colors">{t.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{t.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-100 dark:border-dark-700">
                  <span className="text-xs text-dark-400 flex items-center gap-1"><HiClock className="w-4 h-4" />{t.duration} min</span>
                  <span className="text-xs text-dark-400 flex items-center gap-1"><HiCollection className="w-4 h-4" />{t.problems?.length || 0} problems</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${t.isPublished ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                    {t.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tests;