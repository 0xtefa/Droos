<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',      // 'schedule' or 'attendance'
        'value',     // 'thursday_4', 'wednesday_6', 'online', 'yes', 'no'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
