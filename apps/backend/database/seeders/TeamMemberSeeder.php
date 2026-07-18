<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            ['name' => 'John Paul Narvasa', 'role' => 'CEO & Founder', 'bio' => 'Visionary leader with over a decade of experience in digital marketing and web development. John founded Adsvance Media Tech to empower small businesses with affordable, beautiful web presence.', 'social_links' => ['linkedin' => 'https://linkedin.com/in/johnpaulnarvasa', 'twitter' => 'https://twitter.com/johnpaulnarvasa'], 'sort_order' => 1],
            ['name' => 'Maria Santos', 'role' => 'Lead Designer', 'bio' => 'Award-winning UI/UX designer who crafts intuitive, beautiful interfaces. Maria ensures every pixel serves a purpose and every user journey feels effortless.', 'social_links' => ['linkedin' => 'https://linkedin.com/in/mariasantos', 'twitter' => null], 'sort_order' => 2],
            ['name' => 'Carlos Reyes', 'role' => 'Senior Developer', 'bio' => 'Full-stack engineer specialising in Laravel, Next.js, and cloud architecture. Carlos turns complex requirements into clean, maintainable code.', 'social_links' => ['linkedin' => 'https://linkedin.com/in/carlosreyes', 'twitter' => 'https://twitter.com/carlosreyes'], 'sort_order' => 3],
            ['name' => 'Anna Lim', 'role' => 'Marketing Strategist', 'bio' => 'Data-driven marketing professional with expertise in SEO, SEM, and social media strategy. Anna helps clients achieve measurable growth.', 'social_links' => ['linkedin' => 'https://linkedin.com/in/annualim', 'twitter' => null], 'sort_order' => 4],
        ];

        foreach ($members as $member) {
            TeamMember::create($member);
        }

        $this->command->info('Seeded ' . count($members) . ' team members.');
    }
}
