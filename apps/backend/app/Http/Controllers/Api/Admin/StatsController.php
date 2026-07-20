<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Service;
use App\Models\Subscriber;
use Illuminate\Support\Facades\Schema;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'services' => $this->safeCount(Service::class),
            'blog_posts' => $this->safeCount(BlogPost::class),
            'unread_messages' => $this->safeCount(ContactMessage::class, ['read_at' => null]),
            'subscribers' => $this->safeCount(Subscriber::class),
        ]);
    }

    protected function safeCount(string $modelClass, array $conditions = []): int
    {
        try {
            $query = $modelClass::query();
            foreach ($conditions as $column => $value) {
                $query->where($column, $value);
            }
            return $query->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }
}
