<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogsController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'action' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Log::query()
            ->with('user')
            ->whereNotLike('action', 'view%')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (! empty($filters['search'])) {
            $search = '%'.trim($filters['search']).'%';

            $query->where(function (Builder $query) use ($search): void {
                $query->where('action', 'like', $search)
                    ->orWhere('description', 'like', $search)
                    ->orWhereHas('user', function (Builder $query) use ($search): void {
                        $query->where('name', 'like', $search)
                            ->orWhere('email', 'like', $search);
                    });
            });
        }

        $logs = $query->paginate($filters['per_page'] ?? 20)->withQueryString();
        $logs->through(fn (Log $log): array => [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'user_name' => $log->user_id === null ? 'System' : $log->user->name,
            'user_email' => $log->user_id === null ? null : $log->user->email,
            'action' => $log->action,
            'description' => $log->description,
            'loggable_type' => $log->loggable_type,
            'loggable_id' => $log->loggable_id,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'payload' => $log->payload,
            'created_at' => $log->created_at,
        ]);

        return Inertia::render('Logs', [
            'logs' => $logs,
            'filters' => [
                'actions' => Log::query()->distinct()->whereNotLike('action', 'view%')->orderBy('action')->pluck('action'),
                'users' => User::query()->select('id', 'name', 'email')->orderBy('name')->get(),
            ],
        ]);
    }
}
