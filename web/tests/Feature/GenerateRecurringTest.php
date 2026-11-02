<?php

use App\Models\Category;
use App\Models\Recurring;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schedule;

test('monthly recurring transactions run on month end when the configured day does not exist', function () {
    $this->travelTo(Carbon::parse('2026-02-28 00:01:00'));

    $category = Category::factory()->create(['type' => 'expense']);
    $recurring = Recurring::create([
        'category_id' => $category->id,
        'amount' => 1800,
        'frequency' => 'monthly',
        'start_date' => '2026-01-31',
        'description' => 'Monthly rent',
    ]);

    $this->artisan('generate-recurring')->assertSuccessful();
    $this->artisan('generate-recurring')->assertSuccessful();

    $transactions = Transaction::query()
        ->where('recurring_id', $recurring->id)
        ->get();

    expect($transactions)->toHaveCount(1)
        ->and($transactions->first()->transaction_date->toDateString())->toBe('2026-02-28')
        ->and($transactions->first()->is_recurring_generated)->toBeTrue();
});

test('does not treat unsupported weekly recurring entries as monthly', function () {
    $this->travelTo(Carbon::parse('2026-03-03 00:01:00', 'UTC'));

    $category = Category::factory()->create(['type' => 'expense']);
    $recurring = Recurring::create([
        'category_id' => $category->id,
        'amount' => 500,
        'frequency' => 'weekly',
        'start_date' => '2026-03-03',
        'description' => 'Weekly gas expense',
    ]);

    $this->artisan('generate-recurring')->assertSuccessful();

    expect(Transaction::query()->where('recurring_id', $recurring->id)->exists())->toBeFalse();
});

test('recurring generation is scheduled daily in the business timezone', function () {
    $event = collect(Schedule::events())->first(
        fn ($event) => str_contains($event->command, 'generate-recurring')
    );

    expect($event)->not->toBeNull()
        ->and($event->getExpression())->toBe('1 0 * * *')
        ->and($event->timezone)->toBe('Asia/Manila');
});
