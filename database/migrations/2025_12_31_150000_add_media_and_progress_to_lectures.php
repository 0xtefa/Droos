<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('lectures', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('description');
        });

        Schema::create('lecture_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lecture_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at');
            $table->timestamps();
            $table->unique(['user_id', 'lecture_id']);
        });

        Schema::create('lecture_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->cascadeOnDelete();
            $table->longText('summary');
            $table->string('generated_by')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->unique('lecture_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecture_summaries');
        Schema::dropIfExists('lecture_completions');

        Schema::table('lectures', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
    }
};
