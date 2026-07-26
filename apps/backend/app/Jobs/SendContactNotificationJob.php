<?php

namespace App\Jobs;

use App\Mail\ContactNotificationMail;
use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendContactNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    public function __construct(
        public ContactMessage $contactMessage,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $notificationEmail = config('contacts.notification_email', 'admin@adsvance.com');

        Mail::to($notificationEmail)->send(
            new ContactNotificationMail($this->contactMessage)
        );
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Failed to send contact notification email', [
            'contact_message_id' => $this->contactMessage->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
