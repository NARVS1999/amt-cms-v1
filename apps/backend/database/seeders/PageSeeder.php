<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::create([
            'title' => 'Home',
            'slug' => 'home',
            'hero_heading' => 'Grow Your Business with Data-Driven Marketing',
            'hero_subtext' => 'We help brands amplify their digital presence through cutting-edge SEO, targeted advertising, and conversion-optimized web experiences.',
            'sections' => [
                ['type' => 'features', 'heading' => 'Why Choose Adsvance', 'content' => 'We combine years of industry expertise with a passion for innovation. Our team works closely with each client to deliver tailored solutions that drive real results — from increased traffic to higher conversions.'],
                ['type' => 'cta', 'heading' => 'Ready to Transform Your Online Presence?', 'content' => 'Let us help you build a website that works as hard as you do. Get in touch for a free consultation.'],
            ],
            'is_published' => true,
        ]);

        $this->command->info('Seeded homepage page.');
    }
}
