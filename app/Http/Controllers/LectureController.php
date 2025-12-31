<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LectureController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $this->authorize('view', $course);

        $user = request()->user();

        $lectures = $course->lectures()
            ->with(['quiz', 'summary'])
            ->orderBy('position')
            ->get();

        $completedIds = [];
        if ($user && $lectures->isNotEmpty()) {
            $completedIds = $course->lectures()
                ->whereIn('id', $lectures->pluck('id'))
                ->whereHas('completions', fn ($q) => $q->where('user_id', $user->id))
                ->pluck('id')
                ->all();
        }

        $lectures = $lectures->map(function ($lecture) use ($completedIds) {
            $lecture->is_completed = in_array($lecture->id, $completedIds, true);
            return $lecture;
        })->values();

        return response()->json($lectures);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:0'],
            'video_url' => ['nullable', 'url'],
            'audio_url' => ['nullable', 'url'],
        ]);

        $lecture = $course->lectures()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'position' => $validated['position'] ?? 0,
            'video_url' => $validated['video_url'] ?? null,
            'audio_url' => $validated['audio_url'] ?? null,
        ]);

        return response()->json($lecture, 201);
    }
}
