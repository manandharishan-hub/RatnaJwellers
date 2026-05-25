<?php

namespace Database\Seeders;

use App\Models\ExpertAvailableDate;
use Illuminate\Database\Seeder;

class ExpertAvailableDateSeeder extends Seeder
{
    public function run(): void
    {
        ExpertAvailableDate::where('expert_id', 5)->delete();

        ExpertAvailableDate::updateOrCreate(
            [
                'expert_id' => 5,
                'date' => '2026-05-10',
                'start_time' => '10:00',
                'end_time' => '17:00',
            ],
            [
                'is_active' => true,
            ]
        );
    }
}
