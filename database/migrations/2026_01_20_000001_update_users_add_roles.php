<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // تحديث حقل role ليشمل الأدوار الجديدة
        Schema::table('users', function (Blueprint $table) {
            // حذف العمود القديم وإضافة الجديد
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'moderator', 'admin'])->default('student')->after('email');
        });

        // جدول العلاقة بين المتابعين والطلاب
        Schema::create('moderator_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moderator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // منع التكرار
            $table->unique(['moderator_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moderator_student');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'instructor'])->default('student')->after('email');
        });
    }
};
