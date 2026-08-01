'use client';

import { useState, type FormEvent } from 'react';
import { ContactRequestSchema } from '@amt/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setValidationErrors({});
    setSuccess(false);

    // Client-side validation
    const result = ContactRequestSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ValidationErrors;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      }
      setValidationErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.status === 201) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        return;
      }

      if (res.status === 422) {
        const data = await res.json();
        setServerError(data.message || 'Please check your input and try again.');
        return;
      }

      if (res.status === 429) {
        setServerError('Too many attempts. Please try again in a minute.');
        return;
      }

      setServerError('Could not submit message. Please try again.');
    } catch {
      setServerError('Could not submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ background: 'var(--color-background)' }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20">
        <p
          className="text-center text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Get in Touch
        </p>
        <h1
          className="mt-4 text-center text-3xl font-bold md:text-4xl"
          style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-heading)' }}
        >
          Let&apos;s Talk About Your Project
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl text-center text-base"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Ready to grow your business online? Send us a message.
        </p>

        {/* Success Banner */}
        {success && (
          <div
            className="mx-auto mt-8 max-w-2xl rounded-lg border p-4 text-center"
            style={{
              background: 'var(--color-success)',
              borderColor: 'var(--color-success)',
              color: '#fff',
            }}
          >
            <i className="fa-solid fa-check-circle mr-2" />
            Thank you! We&apos;ll get back to you soon.
          </div>
        )}

        {/* Error Banner */}
        {serverError && (
          <div
            className="mx-auto mt-8 max-w-2xl rounded-lg border p-4 text-center"
            style={{
              background: 'var(--color-error)',
              borderColor: 'var(--color-error)',
              color: '#fff',
            }}
          >
            <i className="fa-solid fa-exclamation-circle mr-2" />
            {serverError}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contact Form */}
          {/* noValidate: Zod inline errors are the single visible client validation path */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-foreground)' }}
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                aria-invalid={Boolean(validationErrors.name)}
                aria-describedby={validationErrors.name ? 'name-error' : undefined}
                className="w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                style={{
                  background: 'var(--color-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
              {validationErrors.name && (
                <p id="name-error" className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-foreground)' }}
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
                aria-invalid={Boolean(validationErrors.email)}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                className="w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                style={{
                  background: 'var(--color-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-foreground)' }}
              >
                Your Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project..."
                required
                aria-invalid={Boolean(validationErrors.message)}
                aria-describedby={validationErrors.message ? 'message-error' : undefined}
                rows={6}
                className="w-full resize-vertical rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                style={{
                  background: 'var(--color-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
              {validationErrors.message && (
                <p id="message-error" className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                  {validationErrors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="fa-regular fa-paper-plane mr-2" />
                  Send Message
                </>
              )}
            </button>
          </form>

          {/* Contact Info Sidebar */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="flex items-center gap-4 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--color-muted)' }}
              >
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span>Metro Manila, Philippines</span>
            </div>

            <div className="flex items-center gap-4 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--color-muted)' }}
              >
                <i className="fa-solid fa-phone" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span>+63 (2) 1234 5678</span>
            </div>

            <div className="flex items-center gap-4 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--color-muted)' }}
              >
                <i className="fa-solid fa-envelope" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span>hello@adsvancemedia.tech</span>
            </div>

            <div className="flex items-center gap-4 text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--color-muted)' }}
              >
                <i className="fa-regular fa-clock" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
