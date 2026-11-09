<?php

use App\Models\Log;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

it('allows admins to list users through the API', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    User::factory()->create(['name' => 'Rental User', 'user_type' => 'user']);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertOk()
        ->assertJsonFragment(['name' => 'Rental User', 'user_type' => 'user']);
});

it('allows admins to create standard users through the API', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'New Mobile User',
            'email' => 'new-mobile-user@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
        ])
        ->assertCreated()
        ->assertJsonPath('data.user_type', 'user');

    $this->assertDatabaseHas('users', [
        'email' => 'new-mobile-user@example.test',
        'user_type' => 'user',
    ]);
});

it('allows admins to load activity logs through the API', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    Log::create([
        'user_id' => $admin->id,
        'action' => 'Created transaction',
        'description' => 'Recorded rent payment',
        'ip_address' => '127.0.0.1',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/logs')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['last_page']])
        ->assertJsonFragment(['description' => 'Recorded rent payment']);
});

it('denies non-admin users access to admin API endpoints', function () {
    $user = User::factory()->create(['user_type' => 'user']);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertForbidden();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/logs')
        ->assertForbidden();
});

it('allows authenticated users to create categories', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/categories', [
            'name' => 'Mobile Charity',
            'type' => 'expense',
            'is_tuition' => true,
            'is_other' => false,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Mobile Charity')
        ->assertJsonPath('data.is_tuition', true);

    $this->assertDatabaseHas('categories', [
        'name' => 'Mobile Charity',
        'is_tuition' => true,
    ]);
});

it('allows authenticated users to create monthly recurring transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['type' => 'expense']);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/recurring', [
            'category_id' => $category->id,
            'amount' => 1250,
            'frequency' => 'monthly',
            'start_date' => now()->toDateString(),
            'description' => 'Monthly maintenance',
        ])
        ->assertCreated()
        ->assertJsonPath('data.description', 'Monthly maintenance')
        ->assertJsonPath('data.frequency', 'monthly');
});

it('prevents deleting categories used by recurring transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['type' => 'expense']);
    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/recurring', [
            'category_id' => $category->id,
            'amount' => 1250,
            'frequency' => 'monthly',
            'start_date' => now()->toDateString(),
            'description' => 'Monthly maintenance',
        ])
        ->assertCreated();

    $this->deleteJson("/api/v1/categories/{$category->id}")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Category is in use by transactions or recurring transactions and cannot be deleted.');

    $this->assertDatabaseHas('categories', ['id' => $category->id, 'deleted_at' => null]);
});

it('allows authenticated users to update transactions, categories, and recurring transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['type' => 'expense']);
    $transactionResponse = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/transactions', [
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100,
            'transaction_date' => '2026-01-01',
            'description' => 'Old transaction',
        ])
        ->assertCreated();
    $transactionId = $transactionResponse->json('data.id');

    $this->patchJson("/api/v1/transactions/{$transactionId}", [
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 200,
        'transaction_date' => '2026-01-02',
        'description' => 'Updated transaction',
        'remarks' => '',
    ])
        ->assertOk()
        ->assertJsonPath('data.description', 'Updated transaction')
        ->assertJsonPath('data.amount', 200);

    $this->patchJson("/api/v1/categories/{$category->id}", [
        'name' => 'Updated category',
        'type' => 'expense',
        'is_tuition' => true,
        'is_other' => false,
    ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated category')
        ->assertJsonPath('data.is_tuition', true);

    $recurringResponse = $this->postJson('/api/v1/recurring', [
        'category_id' => $category->id,
        'amount' => 500,
        'frequency' => 'monthly',
        'start_date' => '2026-01-01',
        'description' => 'Old recurring transaction',
    ])->assertCreated();
    $recurringId = $recurringResponse->json('data.id');

    $this->patchJson("/api/v1/recurring/{$recurringId}", [
        'category_id' => $category->id,
        'amount' => 750,
        'frequency' => 'monthly',
        'start_date' => '2026-02-01',
        'description' => 'Updated recurring transaction',
    ])
        ->assertOk()
        ->assertJsonPath('data.description', 'Updated recurring transaction')
        ->assertJsonPath('data.amount', 750);
});

it('allows admins to list and restore soft-deleted transactions through the API', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $category = Category::factory()->create(['type' => 'expense']);
    $transaction = Transaction::factory()->create([
        'user_id' => $admin->id,
        'category_id' => $category->id,
        'description' => 'Deleted transaction',
    ]);
    $transaction->delete();

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/transactions/trash')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'description', 'deleted_at']], 'meta' => ['last_page']])
        ->assertJsonFragment(['description' => 'Deleted transaction']);

    $this->patchJson("/api/v1/transactions/{$transaction->id}/restore")
        ->assertOk()
        ->assertJsonPath('data.id', $transaction->id)
        ->assertJsonPath('data.deleted_at', null);

    $this->assertDatabaseHas('transactions', [
        'id' => $transaction->id,
        'deleted_at' => null,
    ]);

    $permanentDelete = Transaction::factory()->create([
        'user_id' => $admin->id,
        'category_id' => $category->id,
    ]);
    $permanentDelete->delete();

    $this->deleteJson("/api/v1/transactions/{$permanentDelete->id}/force-delete")
        ->assertOk();

    $this->assertDatabaseMissing('transactions', ['id' => $permanentDelete->id]);
});

it('restricts transaction trash and permanent delete API actions to admins', function () {
    $user = User::factory()->create(['user_type' => 'user']);
    $transaction = Transaction::factory()->create(['user_id' => $user->id]);
    $transaction->delete();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/transactions/trash')
        ->assertForbidden();

    $this->patchJson("/api/v1/transactions/{$transaction->id}/restore")
        ->assertForbidden();

    $this->deleteJson("/api/v1/transactions/{$transaction->id}/force-delete")
        ->assertForbidden();

    $this->assertSoftDeleted('transactions', ['id' => $transaction->id]);
});
