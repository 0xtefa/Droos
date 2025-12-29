<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'points' => ['required', 'integer', 'min:1'],
            'position' => ['nullable', 'integer', 'min:0'],
            'answers' => ['required', 'array', 'min:2'],
            'answers.*.body' => ['required', 'string'],
            'answers.*.is_correct' => ['required', 'boolean'],
        ]);

        $question = $quiz->questions()->create([
            'body' => $validated['body'],
            'points' => $validated['points'],
            'position' => $validated['position'] ?? 0,
            'type' => 'mcq',
        ]);

        $question->answers()->createMany($validated['answers']);

        $question->load('answers');

        return response()->json($question, 201);
    }
}
