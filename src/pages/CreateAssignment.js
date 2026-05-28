import React, { useState, useEffect, useCallback } from 'react';
import { assignmentAPI, problemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiPlus, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    selectedProblems: [{ problem: '', maxScore: 10 }],
  });

  const fetchProblems = useCallback(async () => {
    try {
      const { data } = await problemAPI.getProblems({ limit: 200 });
      setProblems(data.problems || data);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  if (!isAdmin) return <p className="text-center text-dark-500 mt-20">Access denied</p>;
  if (loading) return <LoadingSpinner />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProblemChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.selectedProblems];
      updated[index] = { ...updated[index], [field]: field === 'maxScore' ? Number(value) : value };
      return { ...prev, selectedProblems: updated };
    });
  };

  const addProblem = () => setForm(prev => ({
    ...prev,
    selectedProblems: [...prev.selectedProblems, { problem: '', maxScore: 10 }],
  }));

  const removeProblem = (i) => setForm(prev => ({
    ...prev,
    selectedProblems: prev.selectedProblems.filter((_, idx) => idx !== i),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    if (form.selectedProblems.some(p => !p.problem)) return toast.error('Select a problem for each entry');

    setSaving(true);
    try {
      await assignmentAPI.create({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || undefined,
        problems: form.selectedProblems.filter(p => p.problem),
      });
      toast.success('Assignment created');
      navigate('/assignments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Create Assignment</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Add a new coding assignment</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Title *</label>
          <input name="title" className="input" value={form.title} onChange={handleChange} placeholder="e.g. Week 1 - Arrays & Strings" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" className="input min-h-[80px]" value={form.description} onChange={handleChange} placeholder="Assignment instructions..." />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input name="dueDate" type="datetime-local" className="input max-w-xs" value={form.dueDate} onChange={handleChange} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label m-0">Problems</label>
            <button type="button" onClick={addProblem} className="btn-ghost text-xs text-primary-600"><HiPlus className="w-3 h-3" /> Add Problem</button>
          </div>
          <div className="space-y-3">
            {form.selectedProblems.map((sp, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-dark-200 dark:border-dark-700">
                <span className="text-xs font-medium text-dark-400 dark:text-dark-500 w-6">#{i + 1}</span>
                <select className="input flex-1" value={sp.problem}
                  onChange={(e) => handleProblemChange(i, 'problem', e.target.value)}>
                  <option value="">Select a problem</option>
                  {problems.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-dark-400 dark:text-dark-500 whitespace-nowrap">Score:</label>
                  <input type="number" className="input w-20" value={sp.maxScore} min="1"
                    onChange={(e) => handleProblemChange(i, 'maxScore', e.target.value)} />
                </div>
                {form.selectedProblems.length > 1 && (
                  <button type="button" onClick={() => removeProblem(i)} className="text-red-500 hover:text-red-600 p-1"><HiTrash className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
          <button type="button" onClick={() => navigate('/assignments')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;