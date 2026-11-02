<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'action', 'description', 'loggable_type', 'loggable_id', 'ip_address', 'user_agent', 'payload'])]
class Log extends Model
{
    /**
     * @property-read User|null $user
     */

    /**
     * @method \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\User> user()
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
