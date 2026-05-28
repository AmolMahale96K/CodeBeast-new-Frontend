import React, { useState, useEffect, useCallback } from 'react';
import { problemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Math', 'Recursion'];
// const LANGUAGES = ['python', 'java', 'c'];

const emptyProblem = {
  title: '', description: '', difficulty: 'Easy', category: 'Arrays',
  tags: '', constraints: '', inputFormat: '', outputFormat: '',
  sampleInput: '', sampleOutput: '', timeLimit: 2, memoryLimit: 256,
  testCases: [{ input: '', expectedOutput: '', isHidden: false }],
};

const ManageProblems = () => {
  const { isAdmin } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProblem);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ search: '', difficulty: '', category: '' });

  const fetchProblems = useCallback(async () => {
    try {
      const { data } = await problemAPI.getProblems({ ...filter, limit: 100 });
      setProblems(data.problems || data);
    } catch (err) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const openCreate = () => { setEditing(null); setForm(emptyProblem); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, difficulty: p.difficulty, category: p.category,
      tags: p.tags?.join(', ') || '', constraints: p.constraints || '',
      inputFormat: p.inputFormat || '', outputFormat: p.outputFormat || '',
      sampleInput: p.sampleInput || '', sampleOutput: p.sampleOutput || '',
      timeLimit: p.timeLimit || 2, memoryLimit: p.memoryLimit || 256,
      testCases: p.testCases?.length ? p.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput, isHidden: tc.isHidden || false })) : [{ input: '', expectedOutput: '', isHidden: false }],
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });
  };

  const addTestCase = () => setForm(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }] }));
  const removeTestCase = (i) => setForm(prev => ({ ...prev, testCases: prev.testCases.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        testCases: form.testCases.filter(tc => tc.input && tc.expectedOutput),
      };
      if (editing) {
        await problemAPI.updateProblem(editing._id, payload);
        toast.success('Problem updated');
      } else {
        await problemAPI.createProblem(payload);
        toast.success('Problem created');
      }
      setShowModal(false);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await problemAPI.deleteProblem(id);
      toast.success('Problem deleted');
      fetchProblems();
    } catch (err) {
      toast.error('Failed to delete problem');
    }
  };

  if (!isAdmin) return <p className="text-center text-dark-500 mt-20">Access denied</p>;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Manage Problems</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{problems.length} problems</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiPlus className="w-4 h-4" /> Add Problem</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input name="search" placeholder="Search..." className="input max-w-xs" value={filter.search}
          onChange={(e) => setFilter(p => ({ ...p, search: e.target.value }))} />
        <select className="input max-w-[140px]" value={filter.difficulty}
          onChange={(e) => setFilter(p => ({ ...p, difficulty: e.target.value }))}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input max-w-[160px]" value={filter.category}
          onChange={(e) => setFilter(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Title</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Category</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Difficulty</th>
                <th className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Success Rate</th>
                <th className="text-right py-3 px-4 font-medium text-dark-500 dark:text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(p => (
                <tr key={p._id} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="py-3 px-4 font-medium text-dark-800 dark:text-dark-200">{p.title}</td>
                  <td className="py-3 px-4 text-dark-500 dark:text-dark-400">{p.category}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>{p.difficulty}</span>
                  </td>
                  <td className="py-3 px-4 text-dark-600 dark:text-dark-400">
                    {p.submissionsCount > 0 ? `${Math.round((p.acceptedCount / p.submissionsCount) * 100)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="btn-ghost p-1.5" title="Edit"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id, p.title)} className="btn-ghost p-1.5 text-red-500 hover:text-red-600" title="Delete"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr><td colSpan="5" className="py-12 text-center text-dark-400 dark:text-dark-500">No problems found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-xl w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">{editing ? 'Edit Problem' : 'Create Problem'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title *</label>
                  <input name="title" className="input" value={form.title} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select name="category" className="input" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select name="difficulty" className="input" value={form.difficulty} onChange={handleChange}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input name="tags" className="input" value={form.tags} onChange={handleChange} placeholder="e.g. Two Pointers, Hash Table" />
                </div>
                <div>
                  <label className="label">Time Limit (seconds)</label>
                  <input name="timeLimit" type="number" className="input" value={form.timeLimit} onChange={handleChange} min="0.5" step="0.5" />
                </div>
                <div>
                  <label className="label">Memory Limit (MB)</label>
                  <input name="memoryLimit" type="number" className="input" value={form.memoryLimit} onChange={handleChange} min="64" step="64" />
                </div>
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea name="description" className="input min-h-[120px]" value={form.description} onChange={handleChange} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Input Format</label>
                  <textarea name="inputFormat" className="input min-h-[60px]" value={form.inputFormat} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Output Format</label>
                  <textarea name="outputFormat" className="input min-h-[60px]" value={form.outputFormat} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Constraints</label>
                  <textarea name="constraints" className="input min-h-[60px]" value={form.constraints} onChange={handleChange} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Sample Input</label>
                  <textarea name="sampleInput" className="input min-h-[60px] font-mono text-xs" value={form.sampleInput} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Sample Output</label>
                  <textarea name="sampleOutput" className="input min-h-[60px] font-mono text-xs" value={form.sampleOutput} onChange={handleChange} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label m-0">Test Cases</label>
                  <button type="button" onClick={addTestCase} className="btn-ghost text-xs text-primary-600"><HiPlus className="w-3 h-3" /> Add</button>
                </div>
                <div className="space-y-3">
                  {form.testCases.map((tc, i) => (
                    <div key={i} className="p-3 rounded-lg border border-dark-200 dark:border-dark-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Test Case #{i + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400">
                            <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(i, 'isHidden', e.target.checked)} />
                            Hidden
                          </label>
                          {form.testCases.length > 1 && (
                            <button type="button" onClick={() => removeTestCase(i)} className="text-red-500 hover:text-red-600"><HiTrash className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <textarea className="input min-h-[50px] font-mono text-xs" placeholder="Input" value={tc.input}
                          onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)} />
                        <textarea className="input min-h-[50px] font-mono text-xs" placeholder="Expected Output" value={tc.expectedOutput}
                          onChange={(e) => handleTestCaseChange(i, 'expectedOutput', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Update Problem' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProblems;