import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const totalPoints = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions?.reduce((sum, q) => sum + (q.points ?? 0), 0);
  }, [quiz]);

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/quizzes/${quizId}`);
        if (!mounted) return;
        setQuiz(data);
      } catch (e) {
        if (!mounted) return;
        const status = e.response?.status;
        if (status === 404) setError('Quiz not found');
        else setError('Failed to load quiz');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  const handleSelect = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;
    setSubmitError(null);
    setSubmitting(true);

    const answers = quiz.questions.map((q) => ({
      question_id: q.id,
      answer_id: selectedAnswers[q.id],
    })).filter((item) => Boolean(item.answer_id));

    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setSubmitError('Please answer all questions.');
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers });
      setResult({ score: data.score, max_score: data.max_score });
    } catch (e) {
      const status = e.response?.status;
      if (status === 409) {
        setSubmitError('You have already submitted this quiz.');
      } else if (status === 422) {
        setSubmitError(e.response?.data?.message ?? 'Validation error.');
      } else {
        setSubmitError('Failed to submit quiz.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-300">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-3 text-sm text-slate-300">{error}</div>
        <Link to="/courses" className="text-sm text-indigo-300 hover:text-indigo-200">
          ← Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-indigo-200">Quiz</div>
          <h1 className="text-3xl font-bold text-white">{quiz?.title}</h1>
          <p className="text-sm text-slate-300">Answer all questions and submit to get your score.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          {quiz?.course_id && (
            <button
              className="text-indigo-300 hover:text-indigo-200"
              type="button"
              onClick={() => navigate(`/courses/${quiz.course_id}`)}
            >
              ← Course
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <div>Questions: {quiz?.questions?.length ?? 0}</div>
        <div>Total points: {totalPoints}</div>
        {result && (
          <div className="mt-2 text-indigo-200">Score: {result.score} / {result.max_score}</div>
        )}
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {submitError}
        </div>
      )}

      {result && (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-100">
          You scored {result.score} out of {result.max_score}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {quiz?.questions?.map((question) => (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm shadow-slate-950/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-wide text-slate-400">Question #{question.position}</div>
                <div className="text-lg font-semibold text-white">{question.body}</div>
                <div className="text-xs text-slate-400">{question.points} points</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {question.answers?.map((answer) => {
                const inputId = `q${question.id}-a${answer.id}`;
                return (
                  <label
                    key={answer.id}
                    htmlFor={inputId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-200 hover:border-indigo-500/60 ${selectedAnswers[question.id] === answer.id ? 'border-indigo-400 bg-indigo-500/10 text-indigo-100' : ''}`}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`question-${question.id}`}
                      value={answer.id}
                      className="h-4 w-4 text-indigo-500"
                      onChange={() => handleSelect(question.id, answer.id)}
                      checked={selectedAnswers[question.id] === answer.id}
                      disabled={Boolean(result)}
                    />
                    <span>{answer.body}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            disabled={submitting || Boolean(result)}
          >
            {submitting ? 'Submitting...' : result ? 'Submitted' : 'Submit quiz'}
          </button>
          <Link to="/courses" className="text-sm text-slate-300 hover:text-slate-100">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
