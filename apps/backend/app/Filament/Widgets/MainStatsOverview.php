<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class MainStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        return [
            Stat::make('Total Services', $this->safeCount('marketing_services'))
                ->icon('heroicon-o-cog-6-tooth')
                ->color('danger')
                ->url('/admin/services'),

            Stat::make('Published Posts', $this->safeCount('marketing_blog_posts', [['is_published', '=', true]]))
                ->icon('heroicon-o-document-text')
                ->color('info')
                ->url('/admin/blog-posts'),

            Stat::make('Unread Messages', $this->safeCount('contact_contact_messages', [['read_at', '=', null]]))
                ->icon('heroicon-o-envelope')
                ->color('success')
                ->url('/admin/messages'),

            Stat::make('Subscribers', $this->safeCount('contact_subscribers'))
                ->icon('heroicon-o-user-group')
                ->color('warning')
                ->url('/admin/subscribers'),
        ];
    }

    private function safeCount(string $table, array $conditions = []): int
    {
        if (!Schema::hasTable($table)) {
            return 0;
        }

        try {
            $query = DB::table($table);
            foreach ($conditions as $condition) {
                if (count($condition) >= 2) {
                    $query->where($condition[0], $condition[1], $condition[2] ?? null);
                }
            }
            return $query->count();
        } catch (\Exception $e) {
            Log::warning('Dashboard stat count failed for table: ' . $table, [
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }
}
