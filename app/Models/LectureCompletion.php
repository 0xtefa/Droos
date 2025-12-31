<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lecture_id',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
