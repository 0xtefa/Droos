<?php

namespace App\Policies;

use App\Models\Lecture;
use App\Models\User;

class LecturePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Lecture $lecture): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Lecture $lecture): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR && $lecture->course->instructor_id === $user->id;
    }

    public function delete(User $user, Lecture $lecture): bool
    {
        return $this->update($user, $lecture);
    }
}
