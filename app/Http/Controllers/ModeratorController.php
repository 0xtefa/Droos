<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModeratorController extends Controller
{
    /**
     * لوحة تحكم المتابع
     */
    public function dashboard(Request $request): JsonResponse
    {
        $moderator = $request->user();

        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $assignedStudents = $moderator->assignedStudents()
            ->withCount(['attendances', 'submissions'])
            ->get();

        $totalAttendance = Attendance::whereIn('user_id', $assignedStudents->pluck('id'))->count();

        return response()->json([
            'assigned_students_count' => $assignedStudents->count(),
            'total_attendance' => $totalAttendance,
            'students' => $assignedStudents,
        ]);
    }

    /**
     * جلب الطلاب المعينين للمتابع
     */
    public function getMyStudents(Request $request): JsonResponse
    {
        $moderator = $request->user();

        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $students = $moderator->assignedStudents()
            ->withCount(['attendances', 'submissions'])
            ->get()
            ->map(function ($student) {
                // جلب آخر حضور
                $lastAttendance = Attendance::where('user_id', $student->id)
                    ->latest()
                    ->first();

                $student->last_attendance = $lastAttendance?->created_at;
                return $student;
            });

        return response()->json($students);
    }

    /**
     * تفاصيل حضور طالب معين
     */
    public function getStudentAttendance(Request $request, User $student): JsonResponse
    {
        $moderator = $request->user();

        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // التحقق أن الطالب معين لهذا المتابع
        if (!$moderator->assignedStudents()->where('users.id', $student->id)->exists()) {
            return response()->json(['message' => 'هذا الطالب غير معين لك'], 403);
        }

        $attendances = Attendance::where('user_id', $student->id)
            ->with('lecture.course')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'student' => $student,
            'attendances' => $attendances,
            'total_attendance' => $attendances->count(),
        ]);
    }

    /**
     * إرسال إشعار لطالب
     */
    public function sendNotificationToStudent(Request $request, User $student): JsonResponse
    {
        $moderator = $request->user();

        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // التحقق أن الطالب معين لهذا المتابع
        if (!$moderator->assignedStudents()->where('users.id', $student->id)->exists()) {
            return response()->json(['message' => 'هذا الطالب غير معين لك'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
        ]);

        $notification = Notification::create([
            'user_id' => $student->id,
            'title' => $validated['title'],
            'message' => $validated['message'] ?? null,
            'type' => 'general',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'تم إرسال الإشعار بنجاح',
            'notification' => $notification,
        ]);
    }
}
