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
        Schema::create('marketing_team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('role', 255);
            $table->text('bio')->nullable();
            $table->json('social_links')->nullable()->comment('JSON object: {linkedin: string|null, twitter: string|null}');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_team_members');
    }
};
