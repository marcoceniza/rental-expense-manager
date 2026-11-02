<?php

use App\Models\User;

test('admin login redirects to the admin dashboard', function () {
    $admin = User::factory()->create([
        'email' => 'admin-login@example.test',
        'user_type' => 'admin',
    ]);

    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/admin/dashboard');
});

test('regular user login redirects to the user dashboard', function () {
    $user = User::factory()->create([
        'email' => 'user-login@example.test',
        'user_type' => 'user',
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
});

test('guests are redirected to login for unknown web pages', function () {
    $this->get('/page-that-does-not-exist')->assertRedirect('/login');
});

test('admins are redirected to their dashboard when visiting login', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)
        ->get('/login')
        ->assertRedirect('/admin/dashboard');
});

test('regular users are redirected to their dashboard when visiting login', function () {
    $user = User::factory()->create(['user_type' => 'user']);

    $this->actingAs($user)
        ->get('/login')
        ->assertRedirect('/dashboard');
});

test('authenticated users still receive not found for unknown web pages', function () {
    $user = User::factory()->create(['user_type' => 'user']);

    $this->actingAs($user)
        ->get('/page-that-does-not-exist')
        ->assertNotFound();
});
