import React, { useState, useEffect } from 'react';
import { assignmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiCalendar, HiClipboardCheck, HiClock } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    assignmentAPI.getAll()
      .then(({ data }) => setAssignments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Assignments</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Coding assignments and tasks</p>
        </div>
        {isAdmin && (
          <Link to="/admin/assignments/new" className="btn-primary">Create Assignment</Link>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <HiClipboardCheck className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
          <p className="text-dark-500 dark:text-dark-400">No assignments available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <Link key={a._id} to={`/assignments/${a._id}`} className="card hover:shadow-md transition-shadow group">
              <div className="card-body">
                <h3 className="font-semibold text-dark-800 dark:text-dark-200 group-hover:text-primary-600 transition-colors">{a.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{a.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-100 dark:border-dark-700">
                  <span className="text-xs text-dark-400 flex items-center gap-1"><HiClock className="w-4 h-4" />{a.problems?.length || 0} problems</span>
                  {a.dueDate && (
                    <span className="text-xs text-dark-400 flex items-center gap-1"><HiCalendar className="w-4 h-4" />{new Date(a.dueDate).toLocaleDateString()}</span>
                  )}
                  <span className={`badge ml-auto ${a.isActive ? 'badge-easy' : 'badge-hard'}`}>{a.isActive ? 'Active' : 'Closed'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;