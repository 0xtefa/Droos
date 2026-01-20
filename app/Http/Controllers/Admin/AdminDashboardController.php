<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Submission;
use App\Models\Lecture;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * إحصائيات لوحة التحكم الرئيسية
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total' => User::count(),
                'students' => User::where('role', 'student')->count(),
                'moderators' => User::where('role', 'moderator')->count(),
                'new_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'courses' => [
                'total' => Course::count(),
                'total_lectures' => Lecture::count(),
            ],
            'attendance' => [
                'total' => Attendance::count(),
                'today' => Attendance::whereDate('created_at', today())->count(),
                'this_week' => Attendance::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'submissions' => [
                'total' => Submission::count(),
                'this_week' => Submission::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'recent_students' => User::where('role', 'student')
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'created_at']),
            'top_courses' => Course::withCount(['lectures'])
                ->orderBy('lectures_count', 'desc')
                ->take(5)
                ->get(),
        ]);
    }
}
