<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\ActivityLogRecorder;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function __construct(private ActivityLogRecorder $recorder) {}

    /**
     * Record successful authentication and report page events.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authenticatedUser = $request->user();
        $response = $next($request);

        if ((! $response->isSuccessful() && ! $response->isRedirect()) || $request->is('api/*')) {
            return $response;
        }

        $action = $this->detectAction($request);

        if ($action === null) {
            return $response;
        }

        $user = Auth::user() instanceof User
            ? Auth::user()
            : ($authenticatedUser instanceof User ? $authenticatedUser : null);

        $this->recorder->record(
            $action,
            $this->descriptionFor($action),
            $user,
            payload: [
                'route' => $request->route()?->getName(),
                'method' => $request->method(),
                'path' => $request->path(),
            ],
        );

        return $response;
    }

    private function detectAction(Request $request): ?string
    {
        $route = $request->route()?->getName() ?? '';
        $path = trim($request->path(), '/');

        if ($path === 'login') {
            return $request->isMethod('post') ? 'login' : 'view_login';
        }

        if ($path === 'logout' || str_contains($route, 'logout')) {
            return 'logout';
        }

        if (str_contains($route, 'register') && $request->isMethod('post')) {
            return 'register';
        }

        if (str_contains($route, 'reports')) {
            return 'view_report';
        }

        if (in_array($path, ['dashboard', 'admin/dashboard'], true)) {
            return 'view_dashboard';
        }

        return null;
    }

    private function descriptionFor(string $action): string
    {
        return match ($action) {
            'login' => 'User logged in successfully',
            'logout' => 'User logged out',
            'register' => 'New user registration',
            'view_login' => 'Login page viewed',
            'view_report' => 'Report viewed',
            'view_dashboard' => 'Dashboard viewed',
            default => "Action: {$action}",
        };
    }
}
