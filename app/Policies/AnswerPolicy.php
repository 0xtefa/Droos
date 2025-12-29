<?php

namespace App\Policies;

use App\Models\Answer;
use App\Models\User;

class AnswerPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Answer $answer): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Answer $answer): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR && $answer->question->quiz->course->instructor_id === $user->id;
    }

    public function delete(User $user, Answer $answer): bool
    {
        return $this->update($user, $answer);
    }
}
