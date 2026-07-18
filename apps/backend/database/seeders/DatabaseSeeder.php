<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'John Paul Narvasa',
            'email' => 'johnpaulnarvasa6@gmail.com',
            'password' => bcrypt('password'),
        ]);

        $this->command->info('Admin user created: johnpaulnarvasa6@gmail.com / password');

        // Seed content
        $this->call([
            ServiceSeeder::class,
            TeamMemberSeeder::class,
            PageSeeder::class,
        ]);
    }
}
