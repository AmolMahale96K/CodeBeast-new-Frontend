import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentAPI, submissionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiArrowLeft, HiCalendar, HiClock, HiCheckCircle,
  HiXCircle, HiCode, HiPlay, HiLightningBolt, HiUser,
} from 'react-icons/hi';

const LANGUAGE_IDS = {
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  python: 'python3',
  javascript: 'javascript',
};

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-problem: code, language, output, status
  const [problemState, setProblemState] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const { data } = await assignmentAPI.getOne(id);
      setAssignment(data.assignment);
      setResult(data.result);

      const initialState = {};
      data.assignment.problems.forEach((p) => {
        initialState[p.problem?._id || p._id] = {
          code: p.problem?.boilerplateCode?.python3 || p.problem?.boilerplateCode?.c || '// Write your solution',
          language: 'c',
          output: '',
          status: '',
          running: false,
          submitted: false,
        };
      });
      setProblemState(initialState);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (problemId, code) => {
    setProblemState((prev) => ({
      ...prev,
      [problemId]: { ...prev[problemId], code },
    }));
  };

  const handleLanguageChange = (problemId, lang) => {
    setProblemState((prev) => ({
      ...prev,
      [problemId]: { ...prev[problemId], language: lang },
    }));
  };

  const handleRun = async (problemId) => {
    const ps = problemState[problemId];
    setProblemState((prev) => ({
      ...prev,
      [problemId]: { ...prev[problemId], running: true, output: '' },
    }));

    try {
      const { data } = await submissionAPI.runCode({
        source_code: ps.code,
        language_id: LANGUAGE_IDS[ps.language] || ps.language,
        stdin: '',
      });
      const out = data.stdout || data.stderr || data.error || data.compile_output || 'No output';
      setProblemState((prev) => ({
        ...prev,
        [problemId]: { ...prev[problemId], output: out },
      }));
    } catch (err) {
      setProblemState((prev) => ({
        ...prev,
        [problemId]: { ...prev[problemId], output: 'Error: ' + (err.response?.data?.message || err.message) },
      }));
    } finally {
      setProblemState((prev) => ({
        ...prev,
        [problemId]: { ...prev[problemId], running: false },
      }));
    }
  };

  const handleSubmit = async (problemId) => {
    const ps = problemState[problemId];
    setSubmitting(true);
    try {
      const { data } = await submissionAPI.submitSolution(problemId, {
        source_code: ps.code,
        language: ps.language,
      });

      setProblemState((prev) => ({
        ...prev,
        [problemId]: {
          ...prev[problemId],
          status: data.submission?.status || 'Pending',
          submitted: true,
          output: data.submission?.status || 'Submitted',
        },
      }));
    } catch (err) {
      setProblemState((prev) => ({
        ...prev,
        [problemId]: {
          ...prev[problemId],
          status: 'Error',
          output: 'Submit failed: ' + (err.response?.data?.message || err.message),
        },
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    const submissions = assignment.problems.map((p) => {
      const probId = p.problem?._id || p._id;
      const ps = problemState[probId];
      return {
        problem: probId,
        code: ps?.code || '',
        language: ps?.language || 'c',
        status: 'Pending',
        score: 0,
      };
    });

    try {
      await assignmentAPI.submit(id, { submissions });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!assignment) {
    return (
      <div className="card p-12 text-center">
        <p className="text-dark-500">Assignment not found</p>
        <Link to="/assignments" className="btn-primary mt-4 inline-block">Back to Assignments</Link>
      </div>
    );
  }

  const dueDatePassed = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/assignments" className="btn-icon p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{assignment.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-dark-500 dark:text-dark-400">
              {assignment.createdBy && (
                <span className="flex items-center gap-1"><HiUser className="w-4 h-4" />{assignment.createdBy.name}</span>
              )}
              <span className="flex items-center gap-1"><HiCode className="w-4 h-4" />{assignment.problems?.length || 0} problems</span>
              {assignment.dueDate && (
                <span className={`flex items-center gap-1 ${dueDatePassed ? 'text-red-500' : ''}`}>
                  <HiCalendar className="w-4 h-4" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {dueDatePassed && <span className="badge badge-hard ml-2">Overdue</span>}
                </span>
              )}
              <span className={`badge ${assignment.isActive ? 'badge-easy' : 'badge-hard'}`}>
                {assignment.isActive ? 'Active' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
        {result ? (
          <div className="card p-4 text-center min-w-[140px]">
            <p className="text-3xl font-bold text-primary-600">{result.percentage}%</p>
            <p className="text-xs text-dark-500">{result.totalScore}/{result.maxScore} pts</p>
            <span className="badge badge-easy mt-1">{result.status}</span>
          </div>
        ) : (
          <button
            onClick={handleSubmitAll}
            disabled={submitting || !assignment.isActive || dueDatePassed}
            className="btn-primary flex items-center gap-2"
          >
            <HiLightningBolt className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Submit All'}
          </button>
        )}
      </div>

      {assignment.description && (
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-2">Description</h3>
            <p className="text-dark-500 dark:text-dark-400 whitespace-pre-wrap">{assignment.description}</p>
          </div>
        </div>
      )}

      {/* Problems */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
          <HiCode className="w-5 h-5 text-primary-600" />
          Problems
        </h2>

        {assignment.problems?.map((p, idx) => {
          const probId = p.problem?._id || p._id;
          const problem = p.problem || p;
          const ps = problemState[probId] || { code: '', language: 'c', output: '', status: '' };

          return (
            <div key={idx} className="card overflow-hidden">
              {/* Problem Header */}
              <div className="card-header flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <Link
                      to={`/problems/${problem.slug || problem._id}`}
                      className="font-semibold text-dark-800 dark:text-dark-200 hover:text-primary-600 transition-colors"
                    >
                      {problem.title || `Problem ${idx + 1}`}
                    </Link>
                    <p className="text-xs text-dark-400">
                      {problem.difficulty && (
                        <span className={`badge ${
                          problem.difficulty === 'Easy' ? 'badge-easy' :
                          problem.difficulty === 'Medium' ? 'badge-warning' : 'badge-hard'
                        }`}>{problem.difficulty}</span>
                      )}
                      <span className="ml-2">Max Score: {p.maxScore || 100}</span>
                    </p>
                  </div>
                </div>
                {ps.status && (
                  <span className={`badge flex items-center gap-1 ${
                    ps.status === 'Accepted' ? 'badge-easy' :
                    ps.status === 'Wrong Answer' ? 'badge-hard' :
                    'badge-warning'
                  }`}>
                    {ps.status === 'Accepted' ? <HiCheckCircle className="w-4 h-4" /> : <HiXCircle className="w-4 h-4" />}
                    {ps.status}
                  </span>
                )}
              </div>

              {/* Code Editor */}
              <div className="card-body space-y-4">
                {/* Language Selector */}
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={ps.language}
                    onChange={(e) => handleLanguageChange(probId, e.target.value)}
                    className="input-field w-auto text-sm py-1.5"
                    disabled={!!result || !assignment.isActive}
                  >
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript</option>
                  </select>

                  <button
                    onClick={() => handleRun(probId)}
                    disabled={ps.running || !!result || !assignment.isActive}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
                  >
                    <HiPlay className="w-4 h-4" />
                    {ps.running ? 'Running...' : 'Run'}
                  </button>

                  <button
                    onClick={() => handleSubmit(probId)}
                    disabled={submitting || !!result || !assignment.isActive}
                    className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
                  >
                    <HiLightningBolt className="w-4 h-4" />
                    Submit
                  </button>
                </div>

                {/* Code Textarea */}
                <textarea
                  value={ps.code}
                  onChange={(e) => handleCodeChange(probId, e.target.value)}
                  disabled={!!result || !assignment.isActive}
                  className="w-full h-48 font-mono text-sm p-4 bg-dark-800 dark:bg-dark-950 text-dark-100 rounded-lg border border-dark-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y disabled:opacity-60"
                  spellCheck={false}
                />

                {/* Output */}
                {ps.output && (
                  <div className="bg-dark-900 dark:bg-black rounded-lg p-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <HiCode className="w-4 h-4 text-dark-400" />
                      <span className="text-dark-400 text-xs font-semibold uppercase tracking-wider">Output</span>
                    </div>
                    <pre className="text-dark-200 whitespace-pre-wrap break-all">{ps.output}</pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentDetail;