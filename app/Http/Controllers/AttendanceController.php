<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Lecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request, Lecture $lecture): JsonResponse
    {
        $this->authorize('create', Attendance::class);

        $existing = Attendance::where('lecture_id', $lecture->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Already attended this lecture.',
            ], 409);
        }

        $attendance = Attendance::create([
            'lecture_id' => $lecture->id,
            'user_id' => $request->user()->id,
            'attended_at' => now(),
        ]);

        return response()->json($attendance, 201);
    }
}
