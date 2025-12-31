<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lecture;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $lecture = Lecture::factory()->create();

        return [
            'course_id' => $lecture->course_id,
            'lecture_id' => $lecture->id,
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'available_at' => null,
            'due_at' => null,
        ];
    }
}
