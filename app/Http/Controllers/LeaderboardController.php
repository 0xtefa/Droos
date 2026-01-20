<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    /**
     * Get the leaderboard data with points calculated from:
     * - Attendance: 100 points per lecture attended
     * - Quiz submissions: Uses the score field directly
     */
    public function index()
    {
        // Get all students
        $students = User::where('role', User::ROLE_STUDENT)->get();

        $leaderboard = $students->map(function ($student) {
            // Calculate attendance points (100 per lecture)
            $attendanceCount = Attendance::where('user_id', $student->id)->count();
            $attendancePoints = $attendanceCount * 100;

            // Calculate quiz points from submissions score
            $quizPoints = Submission::where('user_id', $student->id)
                ->sum('score') * 50; // 50 points per correct answer

            // Total points
            $totalPoints = $attendancePoints + $quizPoints;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'points' => $totalPoints,
                'attendance_count' => $attendanceCount,
                'quiz_score' => $quizPoints,
            ];
        });

        // Sort by points descending
        $sorted = $leaderboard->sortByDesc('points')->values();

        return response()->json($sorted);
    }
}
