<?php

use App\Domains\Billing\Http\Api\PricingPlanController;
use App\Domains\Contact\Http\Api\ContactController;
use App\Domains\Contact\Http\Api\SubscribeController;
use App\Domains\Marketing\Http\Api\BlogPostController;
use App\Domains\Marketing\Http\Api\PageController;
use App\Domains\Marketing\Http\Api\ServiceController;
use App\Domains\Marketing\Http\Api\TeamMemberController;
use App\Domains\Theming\Http\Api\ThemeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public REST API Routes
|--------------------------------------------------------------------------
|
| GET endpoints (stubs — full implementation in Epics 2-5)
| POST endpoints (full implementation for contact & subscribe)
|
*/

// --- GET endpoints (stubs) ---

Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/team', [TeamMemberController::class, 'index']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);

Route::get('/pricing-plans', [PricingPlanController::class, 'index']);

Route::get('/theme', [ThemeController::class, 'index']);

// --- POST endpoints (full implementation) ---

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact');

Route::post('/subscribe', [SubscribeController::class, 'store'])
    ->middleware('throttle:subscribe');

// --- 404 fallback for unknown API routes ---

Route::fallback(function () {
    return response()->json(['message' => 'Not found.'], 404);
});
