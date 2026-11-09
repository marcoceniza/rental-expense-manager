<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        return response()->json([
            'data' => User::query()
                ->select('id', 'name', 'email', 'user_type', 'created_at')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function createUser(Request $request, CreateNewUser $createNewUser): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $user = $createNewUser->create($validated);
        $user->forceFill(['user_type' => 'user'])->save();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function logs(): JsonResponse
    {
        $logs = Log::query()
            ->with('user:id,name,email')
            ->whereNotLike('action', 'view%')
            ->latest()
            ->paginate(20);

        $logs->through(fn (Log $log): array => [
            'id' => $log->id,
            'user_name' => $log->user?->name ?? 'System',
            'user_email' => $log->user?->email,
            'action' => $log->action,
            'description' => $log->description,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'payload' => $log->payload,
            'created_at' => $log->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
