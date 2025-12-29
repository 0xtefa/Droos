<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Course $course): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Course $course): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR && $course->instructor_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }
}
