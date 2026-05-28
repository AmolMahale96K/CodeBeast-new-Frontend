import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemAPI, submissionAPI } from '../services/api';
import Editor from '@monaco-editor/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiPlay, HiCheck, HiClock, HiArrowLeft, HiCode } from 'react-icons/hi';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'python', name: 'Python', defaultCode: '# Write your Python code here\ndef solve():\n    pass\n' },
  { id: 'java', name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}\n' },
  { id: 'c', name: 'C', defaultCode: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}\n' },
];

const ProblemDetail = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [splitPercent, setSplitPercent] = useState(60);
  const isDragging = useRef(false);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          problemAPI.getProblem(slug),
          submissionAPI.getSubmissions(),
        ]);
        setProblem(pRes.data);
        setCode(LANGUAGES[0].defaultCode);
        setSubmissions(sRes.data.filter((s) => s.problem?.slug === slug).slice(0, 10));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setResult(null);
    try {
      const { data } = await submissionAPI.runCode({ code, language, input: problem?.sampleInput || '' });
      setOutput(data.output || data.error || 'No output');
    } catch (err) {
      setOutput('Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await submissionAPI.submitSolution(problem._id, { code, language });
      setResult(data);
      toast.success(data.submission.status === 'Accepted' ? 'Solution Accepted!' : `Result: ${data.submission.status}`);
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang.id);
    const langData = LANGUAGES.find((l) => l.id === lang.id);
    if (!code || LANGUAGES.some((l) => l.defaultCode === code)) {
      setCode(langData.defaultCode);
    }
  };

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const pct = Math.max(20, Math.min(80, (offsetY / rect.height) * 100));
      setSplitPercent(pct);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!problem) return <p className="text-center text-dark-500 mt-20">Problem not found</p>;

  const difficultyBadge = (d) => {
    if (d === 'Easy') return <span className="badge-easy">Easy</span>;
    if (d === 'Medium') return <span className="badge-medium">Medium</span>;
    return <span className="badge-hard">Hard</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/problems" className="btn-ghost p-2"><HiArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-dark-900 dark:text-white">{problem.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {difficultyBadge(problem.difficulty)}
            <span className="text-xs text-dark-400">{problem.category}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
        {/* Left: Problem description + tabs */}
        <div className="card overflow-hidden flex flex-col">
          <div className="flex border-b border-dark-200 dark:border-dark-700">
            <button onClick={() => setActiveTab('description')} className={`px-4 py-2.5 text-sm font-medium ${activeTab === 'description' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-dark-500 dark:text-dark-400'}`}>Description</button>
            <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2.5 text-sm font-medium ${activeTab === 'submissions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-dark-500 dark:text-dark-400'}`}>Submissions</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'description' ? (
              <div className="space-y-4 text-sm text-dark-700 dark:text-dark-300">
                <div dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br/>') }} />
                {problem.inputFormat && (
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Input Format</h3>
                    <p>{problem.inputFormat}</p>
                  </div>
                )}
                {problem.outputFormat && (
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Output Format</h3>
                    <p>{problem.outputFormat}</p>
                  </div>
                )}
                {problem.constraints && (
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Constraints</h3>
                    <p>{problem.constraints}</p>
                  </div>
                )}
                {problem.sampleInput && (
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Sample Input</h3>
                    <pre className="bg-dark-100 dark:bg-dark-800 p-3 rounded-lg text-xs font-mono">{problem.sampleInput}</pre>
                  </div>
                )}
                {problem.sampleOutput && (
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Sample Output</h3>
                    <pre className="bg-dark-100 dark:bg-dark-800 p-3 rounded-lg text-xs font-mono">{problem.sampleOutput}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <p className="text-sm text-dark-400 py-4">No submissions yet</p>
                ) : (
                  submissions.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                      <div className="flex items-center gap-2">
                        {s.status === 'Accepted' ? <HiCheck className="w-4 h-4 text-emerald-500" /> : <HiClock className="w-4 h-4 text-red-500" />}
                        <span className="text-sm font-medium">{s.status}</span>
                      </div>
                      <div className="text-xs text-dark-400">
                        {s.language} • {s.runtime}s • {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Code editor + resizable output */}
        <div className="card overflow-hidden flex flex-col" ref={rightPanelRef}>
          {/* Language selector + actions */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <HiCode className="w-4 h-4 text-dark-400" />
              <select className="text-sm bg-transparent border-none focus:outline-none text-dark-700 dark:text-dark-300" value={language} onChange={(e) => handleLanguageChange(LANGUAGES.find((l) => l.id === e.target.value))}>
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRun} disabled={running} className="btn-secondary text-xs py-1.5 px-3">
                <HiPlay className="w-4 h-4" /> {running ? 'Running...' : 'Run'}
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-success text-xs py-1.5 px-3">
                <HiCheck className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ height: `${splitPercent}%` }} className="shrink-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Resize handle */}
          <div
            className="h-2 bg-dark-200 dark:bg-dark-700 hover:bg-primary-500 dark:hover:bg-primary-500 cursor-row-resize shrink-0 transition-colors group relative"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-dark-400 dark:bg-dark-500 group-hover:bg-white transition-colors" />
          </div>

          {/* Output panel */}
          <div style={{ height: `${100 - splitPercent}%` }} className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-dark-50 dark:bg-dark-800/50 border-b border-dark-200 dark:border-dark-700 shrink-0 flex items-center justify-between">
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Output</span>
              <span className="text-[10px] text-dark-400 dark:text-dark-500">Drag the bar above to resize</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {result ? (
                <div className="space-y-2 text-sm">
                  <div className={`p-3 rounded-lg ${result.submission.status === 'Accepted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                    <p className="font-medium">{result.submission.status}</p>
                    <p className="text-xs mt-1">Test Cases: {result.submission.testCasesPassed}/{result.submission.testCasesTotal} • Runtime: {result.submission.runtime}s</p>
                  </div>
                  {result.results?.map((r, i) => (
                    <div key={i} className={`p-2 rounded text-xs ${r.passed ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                      <div className="flex items-center justify-between">
                        <span className={r.passed ? 'text-emerald-600' : 'text-red-600'}>Test {i + 1}: {r.passed ? '✓ Passed' : '✗ Failed'}</span>
                      </div>
                      {r.error && <pre className="mt-1 text-red-500 whitespace-pre-wrap">{r.error}</pre>}
                      {!r.passed && r.output && (
                        <div className="mt-1 text-xs text-dark-500 dark:text-dark-400">
                          <span className="font-medium">Your output:</span> <code>{r.output}</code>
                        </div>
                      )}
                      {!r.passed && r.expectedOutput && (
                        <div className="mt-0.5 text-xs text-dark-500 dark:text-dark-400">
                          <span className="font-medium">Expected:</span> <code>{r.expectedOutput}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {output ? (
                    <pre className="text-xs font-mono text-dark-700 dark:text-dark-300 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <p className="text-xs text-dark-400">Run your code to see output here</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;