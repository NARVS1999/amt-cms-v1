<?php

namespace App\Http\Controllers\Api;

use App\Jobs\SendContactNotificationJob;
use App\Models\ContactMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\Api\ContactMessageResource;
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

            // Queue email notification (non-blocking)
            SendContactNotificationJob::dispatch($message);
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

    /**
     * Admin: list all contact messages, newest first.
     */
    public function adminIndex()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();

        return $this->success(ContactMessageResource::collection($messages));
    }

    /**
     * Admin: toggle read status of a contact message.
     */
    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);

        $message->read_at = $message->read_at ? null : now();
        $message->save();

        return $this->success(new ContactMessageResource($message));
    }

    /**
     * Admin: delete a contact message.
     */
    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
