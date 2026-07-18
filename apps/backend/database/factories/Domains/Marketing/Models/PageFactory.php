<?php

namespace Database\Factories\Domains\Marketing\Models;

use App\Domains\Marketing\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Marketing\Models\Page>
 */
class PageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Page::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
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
