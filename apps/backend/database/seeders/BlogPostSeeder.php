<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => '10 SEO Strategies That Actually Work in 2026',
                'slug' => '10-seo-strategies-2026',
                'excerpt' => 'Discover the latest SEO techniques that are driving real results for businesses this year.',
                'content' => "Search engine optimization continues to evolve rapidly. In this post, we break down the ten most effective strategies that are delivering measurable results in 2026.\n\nFrom AI-powered content optimization to core web vitals, these techniques will help your business stay ahead of the competition. We cover everything from technical SEO fundamentals to advanced link-building strategies that actually work.\n\nWhether you're a small business owner or a marketing professional, these actionable tips will help you improve your search rankings and drive more organic traffic to your website.",
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'sort_order' => 0,
            ],
            [
                'title' => 'Why Your Website Speed Matters More Than Ever',
                'slug' => 'website-speed-matters',
                'excerpt' => 'Page load time directly impacts your bottom line. Learn how to optimize your site for maximum performance.',
                'content' => "Did you know that a one-second delay in page load time can result in a 7% reduction in conversions? Website speed isn't just a technical concern — it's a business imperative.\n\nIn this article, we explore the key factors affecting website performance and provide practical solutions you can implement today. From image optimization to server-side caching, we cover the most impactful techniques.\n\nWe also share our recommended tools for monitoring and improving your site's speed, ensuring you never lose a potential customer to a slow-loading page again.",
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'sort_order' => 1,
            ],
            [
                'title' => 'The Complete Guide to Digital Marketing for Small Businesses',
                'slug' => 'digital-marketing-guide-small-business',
                'excerpt' => 'Everything you need to know about building an effective digital marketing strategy from scratch.',
                'content' => "Navigating the world of digital marketing can feel overwhelming for small business owners. This comprehensive guide simplifies the process and gives you a clear roadmap to follow.\n\nWe start with the fundamentals: understanding your target audience, setting measurable goals, and choosing the right channels for your business. Then we dive into practical tactics for social media, email marketing, paid advertising, and content creation.\n\nBy the end of this guide, you'll have a complete digital marketing strategy tailored to your business needs and budget. No jargon, no fluff — just actionable advice that delivers results.",
                'is_published' => true,
                'published_at' => now()->subDays(8),
                'sort_order' => 2,
            ],
        ];

        foreach ($posts as $postData) {
            BlogPost::firstOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );
        }

        $this->command->info('Seeded ' . count($posts) . ' blog posts.');
    }
}
