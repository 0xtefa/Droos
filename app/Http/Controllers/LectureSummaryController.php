<?php

namespace App\Http\Controllers;

use App\Models\Lecture;
use Illuminate\Http\JsonResponse;

class LectureSummaryController extends Controller
{
    public function show(Lecture $lecture): JsonResponse
    {
        $this->authorize('view', $lecture->course);

        $summary = $lecture->summary;

        if (! $summary) {
            return response()->json([
                'message' => 'لا يوجد ملخص متاح لهذه المحاضرة بعد.',
            ], 404);
        }

        return response()->json($summary);
    }
}
