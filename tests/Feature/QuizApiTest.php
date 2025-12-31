<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Course;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_submit_and_score_quiz(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $course = Course::create([
            'title' => 'Science',
            'description' => 'Basics',
            'instructor_id' => $instructor->id,
        ]);

        $lecture = $course->lectures()->create([
            'title' => 'Lecture 1',
            'description' => 'Intro',
            'position' => 1,
        ]);

        $quiz = $lecture->quiz()->create([
            'course_id' => $course->id,
            'title' => 'Quiz 1',
        ]);

        $q1 = $quiz->questions()->create([
            'body' => '2+2?',
            'points' => 2,
            'position' => 1,
        ]);
        $a1 = $q1->answers()->create([
            'body' => '4',
            'is_correct' => true,
            'position' => 0,
        ]);
        $q1->answers()->create([
            'body' => '5',
            'is_correct' => false,
            'position' => 1,
        ]);

        $q2 = $quiz->questions()->create([
            'body' => 'Sky color?',
            'points' => 1,
            'position' => 2,
        ]);
        $a2 = $q2->answers()->create([
            'body' => 'Blue',
            'is_correct' => true,
            'position' => 0,
        ]);
        $q2->answers()->create([
            'body' => 'Green',
            'is_correct' => false,
            'position' => 1,
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/quizzes/{$quiz->id}/submit", [
            'answers' => [
                ['question_id' => $q1->id, 'answer_id' => $a1->id],
                ['question_id' => $q2->id, 'answer_id' => $a2->id],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonFragment([
                'score' => 3,
                'max_score' => 3,
            ]);

        $this->assertDatabaseHas('submissions', [
            'quiz_id' => $quiz->id,
            'user_id' => $student->id,
            'score' => 3,
        ]);
    }

    public function test_duplicate_submission_blocked(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $course = Course::factory()->create();
        $lecture = $course->lectures()->create([
            'title' => 'Lecture',
            'description' => 'Test',
            'position' => 1,
        ]);
        $quiz = $lecture->quiz()->create([
            'course_id' => $course->id,
            'title' => 'Quiz',
        ]);
        $question = Question::factory()->create(['quiz_id' => $quiz->id, 'points' => 1]);
        $answer = Answer::factory()->create(['question_id' => $question->id, 'is_correct' => true]);

        $quiz->submissions()->create([
            'user_id' => $student->id,
            'score' => 1,
            'max_score' => 1,
            'answers' => [['question_id' => $question->id, 'answer_id' => $answer->id]],
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/quizzes/{$quiz->id}/submit", [
            'answers' => [
                ['question_id' => $question->id, 'answer_id' => $answer->id],
            ],
        ]);

        $response->assertStatus(409);
    }

    public function test_instructor_cannot_submit(): void
    {
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $lecture = $course->lectures()->create([
            'title' => 'Lecture',
            'description' => 'Test',
            'position' => 1,
        ]);
        $quiz = $lecture->quiz()->create([
            'course_id' => $course->id,
            'title' => 'Quiz',
        ]);
        $question = Question::factory()->create(['quiz_id' => $quiz->id, 'points' => 1]);
        $answer = Answer::factory()->create(['question_id' => $question->id, 'is_correct' => true]);

        Sanctum::actingAs($instructor);

        $response = $this->postJson("/api/quizzes/{$quiz->id}/submit", [
            'answers' => [
                ['question_id' => $question->id, 'answer_id' => $answer->id],
            ],
        ]);

        $response->assertForbidden();
    }
}
