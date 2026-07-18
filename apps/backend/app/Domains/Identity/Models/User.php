<?php

namespace App\Domains\Identity\Models;

// Re-export the default Laravel User model for DDD compliance
// The actual User model remains at App\Models\User but is referenced
// from the Identity domain for domain boundary enforcement (AD-1).
use App\Models\User as BaseUser;

class User extends BaseUser
{
    //
}
