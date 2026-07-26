<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $posts = DB::table('marketing_blog_posts')
            ->orderBy('created_at', 'asc')
            ->get();

        foreach ($posts as $index => $post) {
            DB::table('marketing_blog_posts')
                ->where('id', $post->id)
                ->update(['sort_order' => $index + 1]);
        }
    }

    public function down(): void
    {
        DB::table('marketing_blog_posts')->update(['sort_order' => 0]);
    }
};
