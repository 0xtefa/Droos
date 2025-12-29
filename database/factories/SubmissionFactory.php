<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Submission>
 */
class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'user_id' => User::factory(),
            'score' => 0,
            'max_score' => 0,
            'submitted_at' => now(),
            'answers' => [],
        ];
    }
}
