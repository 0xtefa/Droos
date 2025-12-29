<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LectureApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_can_create_lecture_with_audio(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $course = Course::create([
            'title' => 'Math',
            'description' => 'Basics',
            'instructor_id' => $instructor->id,
        ]);

        Sanctum::actingAs($instructor);

        $response = $this->postJson("/api/courses/{$course->id}/lectures", [
            'title' => 'Lesson 1',
            'description' => 'Intro',
            'position' => 1,
            'audio_url' => 'https://cdn.example.com/audio1.mp3',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('lectures', [
            'title' => 'Lesson 1',
            'course_id' => $course->id,
            'audio_url' => 'https://cdn.example.com/audio1.mp3',
        ]);
    }

    public function test_student_cannot_create_lecture(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $course = Course::create([
            'title' => 'History',
            'description' => 'Basics',
            'instructor_id' => $instructor->id,
        ]);

        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Sanctum::actingAs($student);

        $response = $this->postJson("/api/courses/{$course->id}/lectures", [
            'title' => 'Lesson fail',
        ]);

        $response->assertForbidden();
    }

    public function test_authenticated_user_can_list_lectures(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $course = Course::create([
            'title' => 'Physics',
            'description' => 'Basics',
            'instructor_id' => $instructor->id,
        ]);

        $course->lectures()->create([
            'title' => 'Intro',
            'position' => 0,
        ]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson("/api/courses/{$course->id}/lectures");

        $response
            ->assertOk()
            ->assertJsonFragment(['title' => 'Intro']);
    }
}
