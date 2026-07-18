<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Forward /admin/* requests to Next.js in the same window
Route::any('/admin/{any?}', function ($any = null) {
    $url = 'http://localhost:3000/admin';
    if ($any) {
        $url .= '/' . $any;
    }
    if (request()->getQueryString()) {
        $url .= '?' . request()->getQueryString();
    }
    return redirect()->away($url);
})->where('any', '.*');
