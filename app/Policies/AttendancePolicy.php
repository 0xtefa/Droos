<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($attendance->user_id === $user->id) {
            return true;
        }

        return $user->role === User::ROLE_INSTRUCTOR
            && $attendance->lecture->course->instructor_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_STUDENT;
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        return false;
    }
}
