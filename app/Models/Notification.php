<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    public const TYPE_LECTURE_REMINDER = 'lecture_reminder';
    public const TYPE_GENERAL = 'general';
    public const TYPE_ATTENDANCE = 'attendance';
    public const TYPE_QUIZ = 'quiz';

    protected $fillable = [
        'user_id',
        'announcement_id',
        'title',
        'message',
        'type',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    /**
     * جلب الإشعارات غير المقروءة
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
