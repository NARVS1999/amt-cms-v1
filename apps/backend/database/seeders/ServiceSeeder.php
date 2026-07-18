<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['title' => 'Web Development', 'description' => 'Custom websites built with modern technologies — responsive, fast, and conversion-optimized to grow your business online.', 'icon' => 'fa-solid fa-code', 'is_featured' => true, 'sort_order' => 1],
            ['title' => 'UI/UX Design', 'description' => 'Beautiful, user-centered interfaces that delight your customers and drive engagement across every touchpoint.', 'icon' => 'fa-solid fa-paint-brush', 'is_featured' => false, 'sort_order' => 2],
            ['title' => 'SEO Optimization', 'description' => 'Data-driven SEO strategies that boost your search rankings, drive organic traffic, and increase your online visibility.', 'icon' => 'fa-solid fa-magnifying-glass-chart', 'is_featured' => true, 'sort_order' => 3],
            ['title' => 'Digital Marketing', 'description' => 'Targeted advertising campaigns across social media, search engines, and email — maximising ROI for every peso spent.', 'icon' => 'fa-solid fa-bullhorn', 'is_featured' => false, 'sort_order' => 4],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        $this->command->info('Seeded ' . count($services) . ' services.');
    }
}
