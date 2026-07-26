<?php

namespace App\Http\Controllers\Api;

use App\Models\Subscriber;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubscribeRequest;
use App\Http\Resources\Api\SubscriberResource;
use App\Traits\ApiResponse;

class SubscribeController extends Controller
{
    use ApiResponse;

    public function store(SubscribeRequest $request)
    {
        try {
            $subscriber = Subscriber::create([
                'email' => $request->input('email'),
                'subscribed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            return $this->error('Could not subscribe. Please try again.', 500);
        }

        return $this->success([
            'message' => 'Welcome! You\'ve been subscribed successfully.',
            'subscriber' => [
                'id' => $subscriber->id,
                'email' => $subscriber->email,
                'subscribed_at' => $subscriber->subscribed_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Admin: list all subscribers, newest first.
     */
    public function adminIndex()
    {
        $subscribers = Subscriber::orderBy('created_at', 'desc')->get();

        return $this->success(SubscriberResource::collection($subscribers));
    }

    /**
     * Admin: delete a subscriber.
     */
    public function destroy($id)
    {
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
