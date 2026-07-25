<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('marketing_pages', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('is_published');
        });
    }

    public function down(): void
    {
        Schema::table('marketing_pages', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
