<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin User',
            'password' => bcrypt('password'),
        ]);

        $this->command->info('Admin user created: admin@example.com / password');

        // Seed content
        $this->call([
            ThemeSettingSeeder::class,
            ServiceSeeder::class,
            TeamMemberSeeder::class,
            PricingPlanSeeder::class,
            BlogPostSeeder::class,
            PageSeeder::class,
        ]);
    }
}
