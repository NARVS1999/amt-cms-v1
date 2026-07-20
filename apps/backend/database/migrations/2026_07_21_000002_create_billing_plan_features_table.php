<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pricing_plan_id')
                ->constrained('billing_pricing_plans')
                ->cascadeOnDelete();
            $table->string('description', 255);
            $table->boolean('is_included')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_plan_features');
    }
};
