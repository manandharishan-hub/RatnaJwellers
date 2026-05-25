<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationExpert extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'profile_picture',
        'years_of_experience',
        'specialization',
        'rating',
        'review_count',
        'bio',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'expert_id');
    }

    public function availabilities()
    {
        return $this->hasMany(ExpertAvailability::class, 'expert_id');
    }

    public function specificAvailabilities()
    {
        return $this->hasMany(ExpertAvailableDate::class, 'expert_id');
    }
}
