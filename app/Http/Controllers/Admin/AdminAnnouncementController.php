<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnnouncementController extends Controller
{
    /**
     * عرض جميع الإعلانات
     */
    public function index(): JsonResponse
    {
        $announcements = Announcement::with(['course', 'lecture', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($announcements);
    }

    /**
     * إنشاء إعلان جديد (ميعاد محاضرة أو تذكير)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'type' => ['required', 'in:lecture_schedule,reminder,general'],
            'course_id' => ['nullable', 'exists:courses,id'],
            'lecture_id' => ['nullable', 'exists:lectures,id'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'send_notification' => ['boolean'],
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'message' => $validated['message'] ?? null,
            'type' => $validated['type'],
            'course_id' => $validated['course_id'] ?? null,
            'lecture_id' => $validated['lecture_id'] ?? null,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        // إرسال إشعارات لجميع الطلاب إذا طلب ذلك
        if ($request->boolean('send_notification', false)) {
            $this->sendNotificationsToAllStudents($announcement);
        }

        return response()->json($announcement->load(['course', 'lecture', 'creator']), 201);
    }

    /**
     * تحديث إعلان
     */
    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        $announcement->update($validated);

        return response()->json($announcement->load(['course', 'lecture', 'creator']));
    }

    /**
     * حذف إعلان
     */
    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'تم حذف الإعلان بنجاح']);
    }

    /**
     * إرسال تذكير بميعاد محاضرة لجميع الطلاب
     */
    public function sendReminder(Request $request, Announcement $announcement): JsonResponse
    {
        $this->sendNotificationsToAllStudents($announcement);

        return response()->json([
            'message' => 'تم إرسال التذكير بنجاح',
            'sent_to' => User::where('role', 'student')->count(),
        ]);
    }

    /**
     * جلب الإعلان القادم (ميعاد المحاضرة القادمة)
     */
    public function getNextSchedule(): JsonResponse
    {
        $nextSchedule = Announcement::where('type', 'lecture_schedule')
            ->active()
            ->upcoming()
            ->with(['course', 'lecture'])
            ->first();

        return response()->json($nextSchedule);
    }

    /**
     * إرسال إشعارات لجميع الطلاب
     */
    private function sendNotificationsToAllStudents(Announcement $announcement): void
    {
        $students = User::where('role', 'student')->get();

        $notifications = $students->map(function ($student) use ($announcement) {
            return [
                'user_id' => $student->id,
                'announcement_id' => $announcement->id,
                'title' => $announcement->title,
                'message' => $announcement->message,
                'type' => $announcement->type === 'lecture_schedule' ? 'lecture_reminder' : 'general',
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Notification::insert($notifications);
    }
}
