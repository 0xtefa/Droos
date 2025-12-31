<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lecture;
use App\Models\LectureCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function completeLecture(Request $request, Lecture $lecture): JsonResponse
    {
        $this->authorize('view', $lecture->course);

        LectureCompletion::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'lecture_id' => $lecture->id,
            ],
            [
                'completed_at' => now(),
            ],
        );

        $progress = $this->progressData($request->user()->id, $lecture->course);

        return response()->json([
            'lecture_id' => $lecture->id,
            'is_completed' => true,
            'progress' => $progress,
        ]);
    }

    public function courseProgress(Request $request, Course $course): JsonResponse
    {
        $this->authorize('view', $course);

        $progress = $this->progressData($request->user()->id, $course);

        return response()->json($progress);
    }

    private function progressData(int $userId, Course $course): array
    {
        $lectureIds = $course->lectures()->pluck('id');
        $total = $lectureIds->count();
        $completed = LectureCompletion::where('user_id', $userId)
            ->whereIn('lecture_id', $lectureIds)
            ->count();

        $percentage = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        return [
            'completed' => $completed,
            'total' => $total,
            'percentage' => $percentage,
        ];
    }
}
