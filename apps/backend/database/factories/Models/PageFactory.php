<?php

namespace Database\Factories\Models;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'hero_heading' => fake()->sentence(),
            'hero_subtext' => fake()->sentence(),
            'sections' => [
                ['type' => 'hero', 'heading' => fake()->sentence(), 'content' => fake()->paragraph()],
            ],
            'is_published' => false,
        ];
    }
}
