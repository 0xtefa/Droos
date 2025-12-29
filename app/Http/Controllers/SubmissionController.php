<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Quiz;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function store(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('create', Submission::class);

        if (Submission::where('quiz_id', $quiz->id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'Quiz already submitted.',
            ], 409);
        }

        $payload = $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.answer_id' => ['required', 'integer'],
        ]);

        $questions = $quiz->questions()->with('answers')->get()->keyBy('id');

        $score = 0;
        $maxScore = $questions->sum('points');

        foreach ($payload['answers'] as $item) {
            $question = $questions[$item['question_id']] ?? null;
            if (! $question) {
                return response()->json([
                    'message' => 'Invalid question for this quiz.',
                ], 422);
            }

            /** @var Answer|null $answer */
            $answer = $question->answers->firstWhere('id', $item['answer_id']);
            if (! $answer) {
                return response()->json([
                    'message' => 'Invalid answer for question.',
                ], 422);
            }

            if ($answer->is_correct) {
                $score += $question->points;
            }
        }

        $submission = Submission::create([
            'quiz_id' => $quiz->id,
            'user_id' => $request->user()->id,
            'score' => $score,
            'max_score' => $maxScore,
            'answers' => $payload['answers'],
            'submitted_at' => now(),
        ]);

        return response()->json($submission, 201);
    }
}
