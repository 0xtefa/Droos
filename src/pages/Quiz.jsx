import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { SkeletonQuiz, useToast } from '../components';

export default function Quiz() {
  const { quizId, lectureId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const totalPoints = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions?.reduce((sum, q) => sum + (q.points ?? 0), 0);
  }, [quiz]);

  const currentQuestion = useMemo(() => {
    return quiz?.questions?.[currentQuestionIndex];
  }, [quiz, currentQuestionIndex]);

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

  const handleSelect = (answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerId,
    }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
      setResult({ score: data.score, max_score: data.max_score, answers: data.answers });
      toast.success(`تم تقديم الاختبار - ${data.score}/${data.max_score}`, 'نتيجة الاختبار');
    } catch (e) {
      const status = e.response?.status;
      const backendMessage = e.response?.data?.message;
      const backendErrors = e.response?.data?.errors;
      const errorList = backendErrors ? Object.values(backendErrors).flat().filter(Boolean) : [];

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
    return <SkeletonQuiz />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3 text-sm text-red-600">{error}</div>
          <Link to="/courses" className="text-sm text-blue-700 hover:text-blue-600">
            العودة إلى الدورات
          </Link>
        </div>
      </div>
    );
  }

  // Quiz Results View
  if (result) {
    const percentage = Math.round((result.score / result.max_score) * 100);
    const wrongAnswers = quiz.questions.filter((q) => {
      const userAnswerId = selectedAnswers[q.id];
      const correctAnswerId = q.answers?.find(a => a.is_correct)?.id;
      return userAnswerId !== correctAnswerId;
    });

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">نتيجة {quiz?.title}</h1>
          <p className="text-center text-gray-600 mb-6">أحسنت! اكتمل الاختبار برمجته إليك ملخص إجاباتك</p>

          {/* Statistics */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Correct Answers */}
              <div className="bg-gray-100 rounded-lg p-6 text-center flex-1">
                <p className="text-gray-600 mb-2">الإجابات الصحيحة</p>
                <p className="text-3xl font-bold text-gray-800">{result.score}</p>
              </div>

              {/* Wrong Answers */}
              <div className="bg-gray-100 rounded-lg p-6 text-center flex-1">
                <p className="text-gray-600 mb-2">الإجابات الخاطئة</p>
                <p className="text-3xl font-bold text-gray-800">{result.max_score - result.score}</p>
              </div>

              {/* Percentage Circle */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-32 h-32 rounded-full border-8 border-green-400 flex items-center justify-center bg-green-50">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
                    <p className="text-xs text-gray-600">النسبة النهائية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Wrong Answers */}
          {wrongAnswers.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-right">مراجعة الأخطاء</h2>
              <p className="text-gray-600 mb-6 text-right">راجع إجاباتك الخاطئة لتعزيز فهمك</p>

              <div className="space-y-4">
                {wrongAnswers.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Question */}
                    <div className="bg-gray-50 p-4 text-right border-b border-gray-200">
                      <p className="font-semibold text-gray-800">{question.body}</p>
                    </div>

                    {/* Wrong Answer */}
                    <div className="bg-red-50 p-4 text-right border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">إجابتك:</p>
                      <p className="text-gray-800">
                        {question.answers?.find(a => a.id === selectedAnswers[question.id])?.body}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    <div className="bg-green-50 p-4 text-right">
                      <p className="text-sm text-gray-600 mb-1">الإجابة الصحيحة:</p>
                      <p className="text-gray-800">
                        {question.answers?.find(a => a.is_correct)?.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz Questions View
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Title and Info */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">{quiz?.title}</h1>
        <div className="text-center text-gray-600 mb-6">
          السؤال <span className="font-bold text-blue-600">{currentQuestionIndex + 1}</span> من <span className="font-bold">{quiz?.questions?.length}</span>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <p className="text-xl text-gray-800 text-right mb-8 font-semibold">
            {currentQuestion?.body}
          </p>

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion?.answers?.map((answer) => (
              <label
                key={answer.id}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAnswers[currentQuestion.id] === answer.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={answer.id}
                  checked={selectedAnswers[currentQuestion.id] === answer.id}
                  onChange={() => handleSelect(answer.id)}
                  className="w-5 h-5 ml-3 accent-blue-600"
                  disabled={Boolean(result)}
                />
                <span className="text-right text-gray-800">{answer.body}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-right">
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

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center">
          {currentQuestionIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="px-8 py-3 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors"
            >
              السؤال السابق
            </button>
          )}

          {currentQuestionIndex < quiz?.questions?.length - 1 ? (
            <button
              onClick={goToNext}
              className="px-8 py-3 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors"
            >
              السؤال التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'جارٍ الإرسال...' : 'إرسال الاختبار'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
