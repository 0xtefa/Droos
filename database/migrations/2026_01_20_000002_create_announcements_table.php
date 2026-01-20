<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // جدول الإعلانات ومواعيد المحاضرات
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message')->nullable();
            $table->enum('type', ['lecture_schedule', 'reminder', 'general'])->default('general');
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('lecture_id')->nullable()->constrained()->onDelete('cascade');
            $table->dateTime('scheduled_at')->nullable(); // ميعاد المحاضرة
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // جدول التذكيرات المرسلة
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('announcement_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message')->nullable();
            $table->enum('type', ['lecture_reminder', 'general', 'attendance', 'quiz'])->default('general');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('announcements');
    }
};
