<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LectureController;
use App\Http\Controllers\LectureSummaryController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ModeratorController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCourseController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminAnnouncementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/courses', [CourseController::class, 'index']);

// جلب ميعاد المحاضرة القادمة (متاح للجميع)
Route::get('/announcements/next-schedule', [AdminAnnouncementController::class, 'getNextSchedule']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);

    Route::get('/courses/{course}/lectures', [LectureController::class, 'index']);
    Route::post('/courses/{course}/lectures', [LectureController::class, 'store']);
    Route::get('/lectures/{lecture}', [LectureController::class, 'show']);
    Route::post('/lectures/{lecture}/complete', [ProgressController::class, 'completeLecture']);
    Route::get('/courses/{course}/progress', [ProgressController::class, 'courseProgress']);
    Route::get('/lectures/{lecture}/summary', [LectureSummaryController::class, 'show']);

    Route::post('/lectures/{lecture}/attend', [AttendanceController::class, 'store']);

    Route::get('/courses/{course}/quizzes', [QuizController::class, 'index']);
    Route::post('/courses/{course}/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::get('/lectures/{lecture}/quiz', [QuizController::class, 'showByLecture']);
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
    Route::post('/quizzes/{quiz}/submit', [SubmissionController::class, 'store']);

    // Leaderboard
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);

    // Voting
    Route::get('/votes', [VoteController::class, 'index']);
    Route::post('/votes', [VoteController::class, 'store']);

    // Profile
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // ================== Admin Routes ==================
    Route::middleware('admin')->prefix('admin')->group(function () {
        // لوحة التحكم
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // إدارة الكورسات
        Route::get('/courses', [AdminCourseController::class, 'index']);
        Route::post('/courses', [AdminCourseController::class, 'store']);
        Route::put('/courses/{course}', [AdminCourseController::class, 'update']);
        Route::delete('/courses/{course}', [AdminCourseController::class, 'destroy']);
        Route::get('/courses/{course}/statistics', [AdminCourseController::class, 'statistics']);

        // إدارة المستخدمين
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/statistics', [AdminUserController::class, 'statistics']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::post('/users/{user}/promote', [AdminUserController::class, 'promoteToModerator']);
        Route::post('/users/{user}/demote', [AdminUserController::class, 'demoteToStudent']);
        Route::post('/users/{moderator}/assign-students', [AdminUserController::class, 'assignStudents']);
        Route::get('/users/{moderator}/assigned-students', [AdminUserController::class, 'getAssignedStudents']);

        // إدارة الإعلانات ومواعيد المحاضرات
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AdminAnnouncementController::class, 'destroy']);
        Route::post('/announcements/{announcement}/send-reminder', [AdminAnnouncementController::class, 'sendReminder']);
    });

    // ================== Moderator Routes ==================
    Route::middleware('moderator')->prefix('moderator')->group(function () {
        Route::get('/dashboard', [ModeratorController::class, 'dashboard']);
        Route::get('/students', [ModeratorController::class, 'getMyStudents']);
        Route::get('/students/{student}/attendance', [ModeratorController::class, 'getStudentAttendance']);
        Route::post('/students/{student}/notify', [ModeratorController::class, 'sendNotificationToStudent']);
    });
});
