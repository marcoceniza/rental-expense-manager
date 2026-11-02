<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

it('requires authentication to load the dashboard', function () {
    $this->getJson('/api/v1/reports/dashboard')
        ->assertUnauthorized();
});

it('returns dashboard data for the authenticated user', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    Transaction::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 125,
        'transaction_date' => now()->toDateString(),
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/reports/dashboard')
        ->assertOk()
        ->assertJsonPath('monthly_report.expense', 125)
        ->assertJsonCount(1, 'transactions');
});
