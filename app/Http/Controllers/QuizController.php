<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lecture;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $quizzes = $course->quizzes()
            ->with(['lecture'])
            ->withCount('questions')
            ->latest()
            ->get();

        return response()->json($quizzes);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'available_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date', 'after_or_equal:available_at'],
            'lecture_id' => ['required', 'integer', 'exists:lectures,id'],
        ]);

        $lecture = $course->lectures()->findOrFail($validated['lecture_id']);

        $quiz = $lecture->quiz()->create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'available_at' => $validated['available_at'] ?? null,
            'due_at' => $validated['due_at'] ?? null,
        ]);

        return response()->json($quiz, 201);
    }

    public function show(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();

        if ($quiz->lecture && ! $quiz->lecture->completions()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'يجب إكمال المحاضرة قبل بدء الاختبار.',
            ], 403);
        }

        $quiz->load(['questions.answers', 'lecture']);

        return response()->json($quiz);
    }

    public function showByLecture(Request $request, Lecture $lecture): JsonResponse
    {
        $user = $request->user();

        if ($lecture && ! $lecture->completions()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'يجب إكمال المحاضرة قبل بدء الاختبار.',
            ], 403);
        }

        $quiz = $lecture->quiz()->with(['questions.answers', 'lecture'])->firstOrFail();

        return response()->json($quiz);
    }
}
