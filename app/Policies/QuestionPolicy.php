<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Question $question): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Question $question): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR && $question->quiz->course->instructor_id === $user->id;
    }

    public function delete(User $user, Question $question): bool
    {
        return $this->update($user, $question);
    }
}
