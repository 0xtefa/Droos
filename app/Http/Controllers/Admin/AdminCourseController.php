<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Lecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    /**
     * عرض جميع الكورسات مع إحصائيات
     */
    public function index(): JsonResponse
    {
        $courses = Course::with(['instructor', 'lectures'])
            ->withCount(['lectures'])
            ->get()
            ->map(function ($course) {
                // حساب عدد المستمعين لكل كورس
                $listeners = Attendance::whereIn('lecture_id', $course->lectures->pluck('id'))
                    ->distinct('user_id')
                    ->count('user_id');

                $course->listeners_count = $listeners;
                return $course;
            });

        return response()->json($courses);
    }

    /**
     * إنشاء كورس جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $course = Course::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructor_id' => $request->user()->id,
        ])->load('instructor');

        return response()->json($course, 201);
    }

    /**
     * تحديث كورس
     */
    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $course->update($validated);

        return response()->json($course->load('instructor'));
    }

    /**
     * حذف كورس
     */
    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'تم حذف الكورس بنجاح']);
    }

    /**
     * إحصائيات كورس معين - من سمع الكورس ومن لا
     */
    public function statistics(Course $course): JsonResponse
    {
        $lectureIds = $course->lectures->pluck('id');

        // الطلاب الذين حضروا على الأقل محاضرة واحدة
        $attendedUserIds = Attendance::whereIn('lecture_id', $lectureIds)
            ->distinct('user_id')
            ->pluck('user_id');

        // جلب كل الطلاب
        $allStudents = User::where('role', 'student')->get();

        // الطلاب الذين حضروا
        $attendedStudents = $allStudents->whereIn('id', $attendedUserIds)->map(function ($user) use ($lectureIds) {
            $attendedLectures = Attendance::where('user_id', $user->id)
                ->whereIn('lecture_id', $lectureIds)
                ->count();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attended_lectures' => $attendedLectures,
                'total_lectures' => $lectureIds->count(),
                'progress' => $lectureIds->count() > 0
                    ? round(($attendedLectures / $lectureIds->count()) * 100, 1)
                    : 0,
            ];
        })->values();

        // الطلاب الذين لم يحضروا أي محاضرة
        $notAttendedStudents = $allStudents->whereNotIn('id', $attendedUserIds)->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attended_lectures' => 0,
                'total_lectures' => 0,
                'progress' => 0,
            ];
        })->values();

        return response()->json([
            'course' => $course->load('instructor'),
            'total_lectures' => $lectureIds->count(),
            'total_students' => $allStudents->count(),
            'attended_count' => $attendedUserIds->count(),
            'not_attended_count' => $allStudents->count() - $attendedUserIds->count(),
            'attended_students' => $attendedStudents,
            'not_attended_students' => $notAttendedStudents,
        ]);
    }
}
