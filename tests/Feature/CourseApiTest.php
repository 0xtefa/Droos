<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_can_create_course(): void
    {
        $instructor = User::factory()->create([
            'role' => User::ROLE_INSTRUCTOR,
        ]);

        Sanctum::actingAs($instructor);

        $response = $this->postJson('/api/courses', [
            'title' => 'Algebra 101',
            'description' => 'Introductory algebra course',
        ]);

        $response
            ->assertCreated()
            ->assertJsonFragment([
                'title' => 'Algebra 101',
                'description' => 'Introductory algebra course',
                'instructor_id' => $instructor->id,
            ]);

        $this->assertDatabaseHas('courses', [
            'title' => 'Algebra 101',
            'instructor_id' => $instructor->id,
        ]);
    }

    public function test_student_cannot_create_course(): void
    {
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson('/api/courses', [
            'title' => 'Should Fail',
        ]);

        $response->assertForbidden();
    }

    public function test_authenticated_user_can_list_courses(): void
    {
        $instructor = User::factory()->create([
            'role' => User::ROLE_INSTRUCTOR,
        ]);

        Course::create([
            'title' => 'World History',
            'description' => 'Ancient to modern eras',
            'instructor_id' => $instructor->id,
        ]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/courses');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'title' => 'World History',
            ]);
    }
}
