import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Quiz() {
  const { quizId, lectureId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const totalPoints = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions?.reduce((sum, q) => sum + (q.points ?? 0), 0);
  }, [quiz]);

  const backCourseId = useMemo(() => quiz?.lecture?.course_id ?? quiz?.course_id ?? null, [quiz]);
  const fetchPath = useMemo(() => {
    if (lectureId) return `/lectures/${lectureId}/quiz`;
    if (quizId) return `/quizzes/${quizId}`;
    return null;
  }, [lectureId, quizId]);

  useEffect(() => {
    let mounted = true;
    if (!fetchPath) {
      setError('لا يوجد اختبار محدد');
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(fetchPath);
        if (!mounted) return;
        setQuiz(data);
      } catch (e) {
        if (!mounted) return;
        const status = e.response?.status;
        if (status === 403) {
          setError(e.response?.data?.message || 'يجب إكمال المحاضرة قبل بدء الاختبار.');
        } else if (status === 404) {
          setError('لم يتم العثور على الاختبار');
        } else {
          setError('فشل تحميل الاختبار');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchPath]);

  const handleSelect = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;
    setSubmitError(null);
    setValidationErrors([]);
    setSubmitting(true);

    const answers = quiz.questions.map((q) => ({
      question_id: q.id,
      answer_id: selectedAnswers[q.id],
    })).filter((item) => Boolean(item.answer_id));

    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setSubmitError('يرجى الإجابة على جميع الأسئلة.');
      setSubmitting(false);
      return;
    }

    const quizResourceId = quiz?.id;
    if (!quizResourceId) {
      setSubmitError('لا يمكن إرسال الاختبار حاليًا.');
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post(`/quizzes/${quizResourceId}/submit`, { answers });
      setResult({ score: data.score, max_score: data.max_score });
    } catch (e) {
      const status = e.response?.status;
      const backendMessage = e.response?.data?.message;
      const backendErrors = e.response?.data?.errors;
      const errorList = backendErrors ? Object.values(backendErrors).flat().filter(Boolean) : [];

      // Developer-facing log with context for faster debugging.
      console.error('Quiz submit failed', {
        status,
        message: backendMessage,
        errors: backendErrors,
        payload: { answers },
      });

      if (status === 409) {
        setSubmitError('لقد قمت بإرسال هذا الاختبار سابقًا.');
      } else if (status === 422) {
        setSubmitError(backendMessage || 'حدثت مشكلة في التحقق من البيانات.');
        setValidationErrors(errorList);
      } else if (status === 403) {
        setSubmitError(backendMessage || 'أكمل المحاضرة قبل إرسال الاختبار.');
      } else if (status === 401 || status === 419) {
        setSubmitError('انتهت صلاحية الجلسة أو غير مصرح. يرجى تسجيل الدخول مرة أخرى.');
      } else if (!status) {
        setSubmitError('تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مجددًا.');
      } else {
        setSubmitError(backendMessage || 'حدث خطأ غير متوقع أثناء إرسال الاختبار.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-600">جاري تحميل الاختبار...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-3 text-sm text-slate-600">{error}</div>
        <Link to="/courses" className="text-sm text-sky-700 hover:text-sky-600">
          العودة إلى الدورات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-sky-700">الاختبار</div>
          <h1 className="text-3xl font-bold text-slate-900">{quiz?.title}</h1>
          <p className="text-sm text-slate-600">أجب على جميع الأسئلة ثم أرسل للحصول على درجتك.</p>
        </div>
        <div className="flex flex-row-reverse items-center gap-3 text-sm text-slate-600">
          {backCourseId && (
            <button
              className="text-sky-700 hover:text-sky-600"
              type="button"
              onClick={() => navigate(`/courses/${backCourseId}`)}
            >
              العودة إلى الدورة
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm text-right">
        <div>عدد الأسئلة: {quiz?.questions?.length ?? 0}</div>
        <div>إجمالي النقاط: {totalPoints}</div>
        {result && (
          <div className="mt-2 text-sky-700">النتيجة: {result.score} / {result.max_score}</div>
        )}
      </div>

      {submitError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 space-y-1">
          {validationErrors.map((msg, idx) => (
            <div key={idx}>• {msg}</div>
          ))}
        </div>
      )}

      {result && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-right">
          حصلت على {result.score} من {result.max_score}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {quiz?.questions?.map((question) => (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-wide text-slate-500">سؤال #{question.position}</div>
                <div className="text-lg font-semibold text-slate-900">{question.body}</div>
                <div className="text-xs text-slate-500">{question.points} نقاط</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {question.answers?.map((answer) => {
                const inputId = `q${question.id}-a${answer.id}`;
                return (
                  <label
                    key={answer.id}
                    htmlFor={inputId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 transition-colors hover:border-sky-200 ${selectedAnswers[question.id] === answer.id ? 'border-sky-400 bg-sky-50 text-sky-800' : ''}`}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`question-${question.id}`}
                      value={answer.id}
                      className="h-4 w-4 text-sky-600"
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
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-50"
            disabled={submitting || Boolean(result)}
          >
            {submitting ? 'جارٍ الإرسال...' : result ? 'تم الإرسال' : 'إرسال الاختبار'}
          </button>
          <Link to="/courses" className="text-sm text-slate-600 hover:text-slate-800">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
