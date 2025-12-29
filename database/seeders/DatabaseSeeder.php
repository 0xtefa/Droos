<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Answer::truncate();
        Question::truncate();
        Quiz::truncate();
        Lecture::truncate();
        Course::truncate();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $instructor = User::factory()->create([
            'name' => 'Instructor One',
            'email' => 'instructor@example.com',
            'role' => User::ROLE_INSTRUCTOR,
        ]);

        $student = User::factory()->create([
            'name' => 'Student One',
            'email' => 'student@example.com',
            'role' => User::ROLE_STUDENT,
        ]);

        $courses = Course::factory(2)->create([
            'instructor_id' => $instructor->id,
        ]);

        foreach ($courses as $course) {
            $lectures = Lecture::factory(3)->create([
                'course_id' => $course->id,
            ]);

            foreach ($lectures as $lecture) {
                $student->attendances()->create([
                    'lecture_id' => $lecture->id,
                    'attended_at' => now(),
                ]);
            }

            $quiz = Quiz::factory()->create([
                'course_id' => $course->id,
                'title' => $course->title . ' Quiz',
            ]);

            $questions = Question::factory(3)->create([
                'quiz_id' => $quiz->id,
            ]);

            foreach ($questions as $question) {
                $answers = Answer::factory(4)->create([
                    'question_id' => $question->id,
                ]);

                // Mark one as correct
                $answers->first()->update(['is_correct' => true]);
            }
        }
    }
}
