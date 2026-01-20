<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Attendance;
use App\Models\Submission;
use App\Models\LectureCompletion;
use App\Models\Course;

class ProfileController extends Controller
{
    /**
     * Get user profile stats and course progress
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Calculate attendance count
        $attendanceCount = Attendance::where('user_id', $user->id)->count();

        // Calculate quizzes taken
        $quizzesTaken = Submission::where('user_id', $user->id)->count();

        // Calculate completed lectures
        $completedLectures = LectureCompletion::where('user_id', $user->id)->count();

        // Calculate total points
        $attendancePoints = $attendanceCount * 100;
        $quizPoints = Submission::where('user_id', $user->id)->sum('score') * 50;
        $totalPoints = $attendancePoints + $quizPoints;

        // Get courses with progress
        $courses = Course::with(['lectures'])->get()->map(function ($course) use ($user) {
            $totalLectures = $course->lectures->count();
            $completedLectures = LectureCompletion::where('user_id', $user->id)
                ->whereIn('lecture_id', $course->lectures->pluck('id'))
                ->count();

            $progress = $totalLectures > 0 ? round(($completedLectures / $totalLectures) * 100) : 0;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'totalLectures' => $totalLectures,
                'completedLectures' => $completedLectures,
                'progress' => $progress,
            ];
        })->filter(function ($course) {
            // Only show courses where user has some progress
            return $course['completedLectures'] > 0 || $course['progress'] > 0;
        })->values();

        // Count enrolled courses (courses with any activity)
        $enrolledCourses = $courses->count();

        return response()->json([
            'stats' => [
                'totalPoints' => $totalPoints,
                'enrolledCourses' => $enrolledCourses,
                'completedLectures' => $completedLectures,
                'quizzesTaken' => $quizzesTaken,
                'attendanceCount' => $attendanceCount,
            ],
            'courses' => $courses,
        ]);
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = '/storage/' . $path;
        $user->save();

        return response()->json([
            'message' => 'تم تحديث الصورة بنجاح',
            'avatar' => $user->avatar,
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['كلمة المرور الحالية غير صحيحة'],
            ]);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح',
        ]);
    }
}
