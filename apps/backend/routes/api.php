<?php

use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PricingPlanController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubscribeController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\ThemeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public REST API Routes
|--------------------------------------------------------------------------
|
| GET endpoints — content served to the Next.js frontend at build time
| POST endpoints — contact form and newsletter subscription
|
*/

// --- GET endpoints ---

Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/team', [TeamMemberController::class, 'index']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);

Route::get('/pricing-plans', [PricingPlanController::class, 'index']);

Route::get('/theme', [ThemeController::class, 'index']);

// --- POST endpoints ---

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact');

Route::post('/subscribe', [SubscribeController::class, 'store'])
    ->middleware('throttle:subscribe');

// --- Auth endpoints (for admin panel) ---

Route::post('/admin/login', [AdminAuthController::class, 'login'])
    ->middleware('throttle:admin-login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);

    // Admin: list all pages (including unpublished)
    Route::get('/admin/pages', [PageController::class, 'adminIndex']);

    // Admin CRUD: Services
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Admin CRUD: Team Members
    Route::post('/team', [TeamMemberController::class, 'store']);
    Route::put('/team/{teamMember}', [TeamMemberController::class, 'update']);
    Route::delete('/team/{teamMember}', [TeamMemberController::class, 'destroy']);

    // Admin CRUD: Pages
    Route::post('/pages', [PageController::class, 'store']);
    Route::put('/pages/{page}', [PageController::class, 'update']);
    Route::delete('/pages/{page}', [PageController::class, 'destroy']);

    // Admin CRUD: Pricing Plans
    Route::post('/pricing-plans', [PricingPlanController::class, 'store']);
    Route::put('/pricing-plans/{pricingPlan}', [PricingPlanController::class, 'update']);
    Route::delete('/pricing-plans/{pricingPlan}', [PricingPlanController::class, 'destroy']);

    // Admin: Dashboard Stats
    Route::get('/admin/stats', [StatsController::class, 'index']);

    // Admin: Media Library
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
});

// --- 404 fallback for unknown API routes ---

Route::fallback(function () {
    return response()->json(['message' => 'Not found.'], 404);
});
