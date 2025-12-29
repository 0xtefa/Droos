<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $quizzes = $course->quizzes()->withCount('questions')->latest()->get();

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
        ]);

        $quiz = $course->quizzes()->create($validated);

        return response()->json($quiz, 201);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $quiz->load(['questions.answers']);

        return response()->json($quiz);
    }
}
