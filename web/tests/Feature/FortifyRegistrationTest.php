<?php

test('public registration page redirects to login', function () {
    $this->get('/register')->assertRedirect('/login');
});

test('public registration endpoint cannot create users', function () {
    $this->post('/register', [
        'name' => 'Public User',
        'email' => 'public-user@example.test',
        'password' => 'StrongPassword123!',
        'password_confirmation' => 'StrongPassword123!',
    ])->assertStatus(405);

    $this->assertDatabaseMissing('users', [
        'email' => 'public-user@example.test',
    ]);
});
