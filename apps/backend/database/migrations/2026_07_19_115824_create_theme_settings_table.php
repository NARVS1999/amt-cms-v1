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
        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            // Colors
            $table->string('primary_color', 7)->default('#FF0000');
            $table->string('secondary_color', 7)->default('#fb3d03');
            $table->string('accent_color', 7)->default('#FFC107');
            $table->string('background_color', 7)->default('#FFFFFF');
            $table->string('foreground_color', 7)->default('#333333');
            $table->string('muted_color', 7)->default('#f5f5f5');
            $table->string('muted_foreground_color', 7)->default('#888888');
            $table->string('border_color', 7)->default('#f0f0f0');
            $table->string('success_color', 7)->default('#22c55e');
            $table->string('error_color', 7)->default('#ef4444');
            // Typography
            $table->string('body_font', 100)->default('Poppins');
            $table->string('heading_font', 100)->default('Poppins');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_settings');
    }
};
