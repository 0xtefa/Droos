<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    /**
     * Get all votes with totals and user's own votes
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get vote totals
        $scheduleVotes = Vote::where('type', 'schedule')
            ->selectRaw('value, COUNT(*) as count')
            ->groupBy('value')
            ->pluck('count', 'value')
            ->toArray();

        $attendanceVotes = Vote::where('type', 'attendance')
            ->selectRaw('value, COUNT(*) as count')
            ->groupBy('value')
            ->pluck('count', 'value')
            ->toArray();

        // Get user's votes
        $myScheduleVote = Vote::where('user_id', $user->id)
            ->where('type', 'schedule')
            ->first();

        $myAttendanceVote = Vote::where('user_id', $user->id)
            ->where('type', 'attendance')
            ->first();

        return response()->json([
            'totals' => [
                'schedule' => $scheduleVotes,
                'attendance' => $attendanceVotes,
            ],
            'myVotes' => [
                'schedule' => $myScheduleVote?->value,
                'attendance' => $myAttendanceVote?->value,
            ],
        ]);
    }

    /**
     * Store or update a vote
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:schedule,attendance',
            'value' => 'required|string',
        ]);

        $user = $request->user();
        $type = $request->input('type');
        $value = $request->input('value');

        // Validate value based on type
        $validValues = [
            'schedule' => ['thursday_4', 'wednesday_6', 'online'],
            'attendance' => ['yes', 'no'],
        ];

        if (!in_array($value, $validValues[$type])) {
            return response()->json(['message' => 'قيمة غير صالحة'], 422);
        }

        // Update or create vote
        Vote::updateOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            ['value' => $value]
        );

        // Return updated totals
        return $this->index($request);
    }
}
