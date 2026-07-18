<?php

namespace Database\Factories\Domains\Marketing\Models;

use App\Domains\Marketing\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Marketing\Models\TeamMember>
 */
class TeamMemberFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TeamMember::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'bio' => fake()->paragraph(),
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/' . fake()->userName(),
                'twitter' => null,
            ],
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
