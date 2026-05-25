<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpertAvailableDate extends Model
{
    use HasFactory;

    protected $table = 'expert_available_dates';

    protected $fillable = [
        'expert_id',
        'date',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function expert()
    {
        return $this->belongsTo(ConsultationExpert::class, 'expert_id');
    }
}
