<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * جلب إشعارات المستخدم الحالي
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->with('announcement')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * تعليم إشعار كمقروء
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'تم تعليم الإشعار كمقروء']);
    }

    /**
     * تعليم جميع الإشعارات كمقروءة
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json(['message' => 'تم تعليم جميع الإشعارات كمقروءة']);
    }
}
