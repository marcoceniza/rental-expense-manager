<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\CreateNewUser;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/CreateUser');
    }

    public function store(Request $request, CreateNewUser $createNewUser): RedirectResponse
    {
        $user = $createNewUser->create($request->only([
            'name',
            'email',
            'password',
            'password_confirmation',
        ]));

        event(new Registered($user));

        return to_route('admin.create-user')->with('success', 'Created user successfully.');
    }
}
