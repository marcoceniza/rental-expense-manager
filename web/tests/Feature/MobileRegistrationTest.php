<?php

test('mobile registration creates a regular account and returns its token', function () {
    $this->postJson('/api/v1/register', [
        'name' => 'Mobile User',
        'email' => 'mobile-user@example.test',
        'password' => 'StrongPassword123!',
        'password_confirmation' => 'StrongPassword123!',
        'user_type' => 'admin',
    ])
        ->assertOk()
        ->assertJsonPath('user.name', 'Mobile User')
        ->assertJsonPath('user.user_type', 'user')
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'user_type']]);

    $this->assertDatabaseHas('users', [
        'email' => 'mobile-user@example.test',
        'user_type' => 'user',
    ]);
});
