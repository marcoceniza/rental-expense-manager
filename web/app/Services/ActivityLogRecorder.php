<?php

namespace App\Services;

use App\Models\Log as ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogRecorder
{
    /**
     * Persist one activity record using request and model context when available.
     *
     * @param  array<string, mixed>  $payload
     */
    public function record(
        string $action,
        string $description,
        ?User $user = null,
        ?Model $subject = null,
        array $payload = [],
    ): void {
        $request = request();
        $user ??= Auth::user() instanceof User ? Auth::user() : null;

        ActivityLog::create([
            'user_id' => $user?->getKey(),
            'action' => $action,
            'description' => $description,
            'loggable_type' => $subject ? $subject::class : null,
            'loggable_id' => $subject?->getKey(),
            'ip_address' => $request ? $request->ip() : null,
            'user_agent' => $request ? $request->userAgent() : null,
            'payload' => $payload === [] ? null : $payload,
        ]);
    }
}
