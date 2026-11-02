<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse;
use Symfony\Component\HttpFoundation\Response;

class RoleBasedLoginResponse implements LoginResponse
{
    /**
     * @param  Request  $request
     */
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();
        $destination = $user instanceof User && $user->isAdmin()
            ? route('admin.dashboard')
            : route('user.dashboard');

        return redirect()->intended($destination);
    }
}
