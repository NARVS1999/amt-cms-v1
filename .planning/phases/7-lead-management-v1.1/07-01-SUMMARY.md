---
phase: 7-lead-management-v1.1
plan: 01
subsystem: backend
tags: [api, admin, contacts, subscribers]
requires: []
provides: [admin-messages-api, admin-subscribers-api]
affects: [apps/backend]
tech-stack: [laravel, php, sanctum, eloquent]
key-files:
  - apps/backend/app/Http/Resources/Api/ContactMessageResource.php
  - apps/backend/app/Http/Resources/Api/SubscriberResource.php
  - apps/backend/app/Http/Controllers/Api/ContactController.php
  - apps/backend/app/Http/Controllers/Api/SubscribeController.php
  - apps/backend/routes/api.php
  - apps/backend/tests/Feature/AdminMessagesTest.php
  - apps/backend/tests/Feature/AdminSubscribersTest.php
decisions:
  - "Used DB::table() in tests to set created_at timestamps (Eloquent update() doesn't touch timestamps)"
  - "Toggle read_at pattern: null→now()→null via single PUT endpoint"
status: complete
---

# Phase 7 Plan 01: Backend Admin API Summary

Five authenticated admin endpoints for managing contact messages and subscribers, consumed by Plan 07-02 frontend pages.

## What Was Built

### API Resource Classes
- **ContactMessageResource** — transforms ContactMessage to `{ id, name, email, message, read_at, created_at, updated_at }`
- **SubscriberResource** — transforms Subscriber to `{ id, email, subscribed_at, created_at, updated_at }`

### Controller Methods
- **ContactController::adminIndex()** — list all messages sorted newest-first
- **ContactController::markAsRead($id)** — toggle read_at (null→timestamp→null)
- **ContactController::destroy($id)** — delete message by ID
- **SubscribeController::adminIndex()** — list all subscribers sorted newest-first
- **SubscribeController::destroy($id)** — delete subscriber by ID

### Routes (all inside `auth:sanctum` group)
| Method | URI | Controller |
|--------|-----|-----------|
| GET | /api/admin/messages | ContactController@adminIndex |
| PUT | /api/admin/messages/{id}/read | ContactController@markAsRead |
| DELETE | /api/admin/messages/{id} | ContactController@destroy |
| GET | /api/admin/subscribers | SubscribeController@adminIndex |
| DELETE | /api/admin/subscribers/{id} | SubscribeController@destroy |

### Feature Tests (11 total)
- AdminMessagesTest (6): list sorted, empty, auth, toggle read, delete, 404
- AdminSubscribersTest (5): list sorted, empty, auth, delete, 404

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ContactMessageResource.php ✓
- SubscriberResource.php ✓
- ContactController.php (updated) ✓
- SubscribeController.php (updated) ✓
- routes/api.php (updated) ✓
- AdminMessagesTest.php ✓
- AdminSubscribersTest.php ✓
- Commit f460b98 ✓
- Commit 072d752 ✓
