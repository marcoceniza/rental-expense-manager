<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('admins can open the create user page', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)
        ->get(route('admin.create-user'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('admin/CreateUser'));
});

test('admins create standard users through the Fortify user action', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.create-user.store'), [
            'name' => 'New Rental User',
            'email' => 'new-rental-user@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
        ])
        ->assertRedirect(route('admin.create-user'));

    $this->assertDatabaseHas('users', [
        'name' => 'New Rental User',
        'email' => 'new-rental-user@example.test',
        'user_type' => 'user',
    ]);
});

test('regular users cannot access admin user creation', function () {
    $user = User::factory()->create(['user_type' => 'user']);

    $this->actingAs($user)
        ->get(route('admin.create-user'))
        ->assertForbidden();
});
