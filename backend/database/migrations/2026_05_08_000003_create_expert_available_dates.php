<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expert_available_dates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expert_id');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('expert_id')->references('id')->on('consultation_experts')->onDelete('cascade');
            $table->unique(['expert_id', 'date', 'start_time', 'end_time'], 'expert_date_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_available_dates');
    }
};
