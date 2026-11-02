<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle an incoming login request.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ])->status(422);
        }

        $token = $user->createToken('mobile-app-access-token');

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(Request $request, CreateNewUser $createNewUser): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $user = $createNewUser->create($validated);
        $user->user_type = 'user';
        $user->save();

        $token = $user->createToken('mobile-app-access-token');

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Get the current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$request->user()->id],
        ]);

        $user = $request->user();
        $user->forceFill($validated)->save();

        return response()->json(['user' => $this->formatUser($user)]);
    }

    /**
     * Format the user for JSON response.
     */
    private function formatUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at ? $user->created_at->toIso8601String() : null,
            'updated_at' => $user->updated_at ? $user->updated_at->toIso8601String() : null,
        ];
    }
}
