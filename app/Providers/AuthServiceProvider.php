<?php

namespace App\Providers;

use App\Models\Answer;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Submission;
use App\Policies\AnswerPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\CoursePolicy;
use App\Policies\LecturePolicy;
use App\Policies\QuestionPolicy;
use App\Policies\QuizPolicy;
use App\Policies\SubmissionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Course::class => CoursePolicy::class,
        Lecture::class => LecturePolicy::class,
        Quiz::class => QuizPolicy::class,
        Question::class => QuestionPolicy::class,
        Answer::class => AnswerPolicy::class,
        Submission::class => SubmissionPolicy::class,
        Attendance::class => AttendancePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
