<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::with('instructor')->latest()->get();

        return response()->json($courses);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $course = Course::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructor_id' => $request->user()->id,
        ])->load('instructor');

        return response()->json($course, 201);
    }
}
