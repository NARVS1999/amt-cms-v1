<x-mail::message>
# New Contact Message

A new message has been submitted through the contact form.

**Name:** {{ $name }}
**Email:** {{ $email }}
**Submitted:** {{ $submittedAt }}

---

**Message:**

{{ $message }}

---

Thank you,<br>
{{ config('app.name') }}
</x-mail::message>
