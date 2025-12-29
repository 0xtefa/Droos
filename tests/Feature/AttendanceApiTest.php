<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_attend_once(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $course = Course::factory()->create([
            'instructor_id' => User::factory()->create(['role' => User::ROLE_INSTRUCTOR])->id,
        ]);
        $lecture = $course->lectures()->create([
            'title' => 'Intro',
            'position' => 0,
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/lectures/{$lecture->id}/attend");

        $response->assertCreated();

        $this->assertDatabaseHas('attendances', [
            'lecture_id' => $lecture->id,
            'user_id' => $student->id,
        ]);
    }

    public function test_duplicate_attendance_returns_conflict(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $course = Course::factory()->create([
            'instructor_id' => User::factory()->create(['role' => User::ROLE_INSTRUCTOR])->id,
        ]);
        $lecture = $course->lectures()->create([
            'title' => 'Intro',
            'position' => 0,
        ]);

        Attendance::create([
            'lecture_id' => $lecture->id,
            'user_id' => $student->id,
            'attended_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/lectures/{$lecture->id}/attend");

        $response->assertStatus(409);
    }

    public function test_instructor_cannot_attend(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $lecture = $course->lectures()->create([
            'title' => 'Intro',
            'position' => 0,
        ]);

        Sanctum::actingAs($instructor);

        $response = $this->postJson("/api/lectures/{$lecture->id}/attend");

        $response->assertForbidden();
    }
}
