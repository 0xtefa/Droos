<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecture_id',
        'summary',
        'generated_by',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }
}
