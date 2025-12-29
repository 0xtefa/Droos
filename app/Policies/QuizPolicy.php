<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Quiz $quiz): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Quiz $quiz): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR && $quiz->course->instructor_id === $user->id;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        return $this->update($user, $quiz);
    }
}
