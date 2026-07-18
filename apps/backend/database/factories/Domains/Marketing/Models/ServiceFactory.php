<?php

namespace Database\Factories\Domains\Marketing\Models;

use App\Domains\Marketing\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Marketing\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'icon' => 'fa-solid fa-' . fake()->word(),
            'is_featured' => fake()->boolean(20),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
