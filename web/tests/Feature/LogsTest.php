<?php

use App\Models\Category;
use App\Models\Log;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;

// ── Activity Logs ─────────────────────────────────────────────────────────────

test('logs return a paginated Inertia prop with the filters expected by the page', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    Log::create([
        'user_id' => $admin->id,
        'action' => 'created',
        'description' => 'Transaction created',
    ]);

    $this->actingAs($admin)
        ->get('/admin/logs?per_page=10')
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($admin) {
            $page->component('Logs')
                ->has('logs.data', 1)
                ->where('logs.total', 1)
                ->where('logs.per_page', 10)
                ->where('logs.current_page', 1)
                ->where('logs.data.0.user_id', $admin->id)
                ->where('logs.data.0.user_name', $admin->name)
                ->where('logs.data.0.action', 'created')
                ->has('filters.actions')
                ->has('filters.users', 1);
        });
});

test('logs paginate newest first with stable ordering', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $createdLogs = [];

    foreach (range(1, 5) as $number) {
        $createdLogs[] = Log::create([
            'user_id' => $admin->id,
            'action' => 'created',
            'description' => "Activity {$number}",
        ]);
    }

    $this->actingAs($admin)
        ->get('/admin/logs?per_page=2&page=2')
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($createdLogs) {
            $page->component('Logs')
                ->where('logs.current_page', 2)
                ->where('logs.last_page', 3)
                ->where('logs.total', 5)
                ->where('logs.data.0.id', $createdLogs[2]->id)
                ->where('logs.data.1.id', $createdLogs[1]->id);
        });
});

test('log search and filters apply before pagination', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    foreach (range(1, 5) as $number) {
        Log::create([
            'user_id' => $admin->id,
            'action' => $number % 2 === 0 ? 'updated' : 'created',
            'description' => $number % 2 === 0 ? "findme activity {$number}" : "Other activity {$number}",
        ]);
    }

    $this->actingAs($admin)
        ->get('/admin/logs?search=findme&action=updated&per_page=1&page=2')
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('Logs')
                ->where('logs.total', 2)
                ->where('logs.current_page', 2)
                ->where('logs.data.0.description', 'findme activity 2');
        });
});

test('transaction changes are persisted as activity logs with request metadata', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $category = Category::factory()->create();
    $ipAddress = '203.0.113.42';
    $userAgent = 'Rental-Expense-Test/1.0';

    $this->withServerVariables(['REMOTE_ADDR' => $ipAddress])
        ->withHeaders(['User-Agent' => $userAgent])
        ->actingAs($admin)
        ->post(route('admin.transactions.store'), [
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 125.50,
            'transaction_date' => '2026-10-16',
            'description' => 'Activity tracking test',
        ])
        ->assertRedirect();

    $transaction = Transaction::where('description', 'Activity tracking test')->firstOrFail();
    $log = Log::query()
        ->where('loggable_type', Transaction::class)
        ->where('loggable_id', $transaction->id)
        ->where('action', 'created')
        ->firstOrFail();

    expect($log->user_id)->toBe($admin->id)
        ->and($log->ip_address)->toBe($ipAddress)
        ->and($log->user_agent)->toBe($userAgent)
        ->and($log->payload['description'])->toBe('Activity tracking test');
});

test('successful login is recorded in the activity log', function () {
    $password = 'StrongPassword123!';
    $user = User::factory()->create([
        'email' => 'login-audit@example.test',
        'password' => Hash::make($password),
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => $password,
    ])->assertRedirect('/dashboard');

    $this->assertDatabaseHas('logs', [
        'user_id' => $user->id,
        'action' => 'login',
        'description' => 'User logged in successfully',
    ]);
});
