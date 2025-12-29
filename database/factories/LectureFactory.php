<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Lecture>
 */
class LectureFactory extends Factory
{
    protected $model = \App\Models\Lecture::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->optional()->paragraph(),
            'position' => $this->faker->numberBetween(0, 10),
            'audio_url' => $this->faker->optional()->url(),
        ];
    }
}
