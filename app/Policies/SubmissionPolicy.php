<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Submission $submission): bool
    {
        if ($submission->user_id === $user->id) {
            return true;
        }

        return $user->role === User::ROLE_INSTRUCTOR
            && $submission->quiz->course->instructor_id === $user->id;
    }

    public function create(User $user): bool
    {
        // Allow any authenticated user to submit a quiz (student or instructor).
        return true;
    }

    public function delete(User $user, Submission $submission): bool
    {
        return false;
    }
}
