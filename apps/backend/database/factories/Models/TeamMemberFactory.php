<?php

namespace Database\Factories\Models;

use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeamMember>
 */
class TeamMemberFactory extends Factory
{
    protected $model = TeamMember::class;

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
