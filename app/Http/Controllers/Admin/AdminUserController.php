<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * عرض جميع المستخدمين
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // فلترة حسب الدور
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // البحث بالاسم أو الإيميل
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->withCount(['attendances', 'submissions'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * عرض تفاصيل مستخدم معين
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['attendances.lecture', 'submissions.quiz']);

        return response()->json($user);
    }

    /**
     * ترقية مستخدم إلى متابع
     */
    public function promoteToModerator(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'لا يمكن تغيير دور المسؤول'], 403);
        }

        $user->update(['role' => 'moderator']);

        return response()->json([
            'message' => 'تم ترقية المستخدم إلى متابع بنجاح',
            'user' => $user,
        ]);
    }

    /**
     * تخفيض متابع إلى طالب
     */
    public function demoteToStudent(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'لا يمكن تغيير دور المسؤول'], 403);
        }

        // إزالة الطلاب المعينين للمتابع
        $user->assignedStudents()->detach();
        $user->update(['role' => 'student']);

        return response()->json([
            'message' => 'تم تخفيض المستخدم إلى طالب بنجاح',
            'user' => $user,
        ]);
    }

    /**
     * تعيين طلاب لمتابع
     */
    public function assignStudents(Request $request, User $moderator): JsonResponse
    {
        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'المستخدم ليس متابعاً'], 400);
        }

        $validated = $request->validate([
            'student_ids' => ['required', 'array'],
            'student_ids.*' => ['exists:users,id'],
        ]);

        // التأكد أن جميع الـ IDs هي لطلاب
        $validStudents = User::whereIn('id', $validated['student_ids'])
            ->where('role', 'student')
            ->pluck('id');

        $moderator->assignedStudents()->sync($validStudents);

        return response()->json([
            'message' => 'تم تعيين الطلاب بنجاح',
            'assigned_count' => $validStudents->count(),
        ]);
    }

    /**
     * جلب الطلاب المعينين لمتابع
     */
    public function getAssignedStudents(User $moderator): JsonResponse
    {
        if ($moderator->role !== 'moderator') {
            return response()->json(['message' => 'المستخدم ليس متابعاً'], 400);
        }

        $students = $moderator->assignedStudents()
            ->withCount(['attendances', 'submissions'])
            ->get();

        return response()->json($students);
    }

    /**
     * إحصائيات عامة للمستخدمين
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),
            'students_count' => User::where('role', 'student')->count(),
            'moderators_count' => User::where('role', 'moderator')->count(),
            'admins_count' => User::where('role', 'admin')->count(),
            'new_users_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            'new_users_this_month' => User::where('created_at', '>=', now()->subMonth())->count(),
        ]);
    }
}
