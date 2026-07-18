<?php

namespace App\Http\Controllers\Api;

use App\Models\ContactMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Traits\ApiResponse;

class ContactController extends Controller
{
    use ApiResponse;

    public function store(ContactRequest $request)
    {
        try {
            $message = ContactMessage::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'message' => $request->input('message'),
                'read_at' => null,
            ]);
        } catch (\Throwable $e) {
            return $this->error('Could not submit message. Please try again.', 500);
        }

        return $this->success([
            'message' => 'Thank you! We\'ll get back to you soon.',
            'contact_message' => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'created_at' => $message->created_at?->toIso8601String(),
            ],
        ], 201);
    }
}
