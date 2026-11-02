<?php

namespace Tests;

use App\Models\Category;
use App\Models\Recurring;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SeederTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test that the database can be seeded with comprehensive sample data.
     */
    public function test_database_seeder_creates_comprehensive_sample_data(): void
    {
        // Run the DatabaseSeeder
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);

        // Verify users were created
        $users = User::all();
        $this->assertCount(5, $users);

        // Check that we have both admin and regular users
        $adminUsers = $users->where('user_type', 'admin');
        $regularUsers = $users->where('user_type', 'user');

        $this->assertCount(1, $adminUsers);
        $this->assertCount(4, $regularUsers);

        // Verify all users have valid data
        foreach ($users as $user) {
            $this->assertNotEmpty($user->name);
            $this->assertNotEmpty($user->email);
            $this->assertNotNull($user->password);
        }

        // Verify categories were created
        $categories = Category::all();
        $this->assertGreaterThan(10, $categories->count());

        // Check that we have all the expected category types
        $incomeCategories = $categories->where('type', 'income');
        $expenseCategories = $categories->where('type', 'expense');
        $liabilityCategories = $categories->where('type', 'liability');
        $tuitionCategories = $categories->where('type', 'tuition');
        $otherCategories = $categories->where('type', 'other');

        $this->assertGreaterThan(0, $incomeCategories->count());
        $this->assertGreaterThan(0, $expenseCategories->count());
        $this->assertGreaterThan(0, $liabilityCategories->count());
        $this->assertGreaterThan(0, $tuitionCategories->count());
        $this->assertGreaterThan(0, $otherCategories->count());

        // Verify transactions were created
        $transactions = Transaction::all();
        $this->assertGreaterThan(30, $transactions->count());

        // Check transaction types
        $incomeTransactions = $transactions->where('type', 'income');
        $expenseTransactions = $transactions->where('type', 'expense');
        $liabilityTransactions = $transactions->where('type', 'liability');

        $this->assertGreaterThan(0, $incomeTransactions->count());
        $this->assertGreaterThan(0, $expenseTransactions->count());
        $this->assertGreaterThan(0, $liabilityTransactions->count());

        // Verify transaction amounts are realistic
        foreach ($transactions as $transaction) {
            $this->assertGreaterThanOrEqual(100, $transaction->amount);
            $this->assertLessThanOrEqual(100000, $transaction->amount);
            $this->assertNotEmpty($transaction->description);
            $this->assertNotEmpty($transaction->transaction_date);
        }

        // Verify recurring transactions were created
        $recurringTransactions = Recurring::all();
        $this->assertGreaterThan(0, $recurringTransactions->count());

        // Check that recurring transactions have expected frequencies
        $monthlyRecurring = $recurringTransactions->where('frequency', 'monthly');
        $weeklyRecurring = $recurringTransactions->where('frequency', 'weekly');

        $this->assertGreaterThan(0, $monthlyRecurring->count());
        $this->assertGreaterThan(0, $weeklyRecurring->count());

        // Verify recurring transactions have proper relationships
        foreach ($recurringTransactions as $recurring) {
            $this->assertNotNull($recurring->category_id);
            $this->assertNotNull($recurring->amount);
            $this->assertNotEmpty($recurring->description);
            $this->assertNotEmpty($recurring->start_date);
        }

        // Test that the data is well-distributed
        $transactionsPerUser = $transactions->groupBy('user_id')->map->count();
        $averageTransactionsPerUser = $transactionsPerUser->avg();

        // Each user should have a reasonable number of transactions (between 6 and 15)
        $this->assertGreaterThanOrEqual(6, $averageTransactionsPerUser);
        $this->assertLessThanOrEqual(15, $averageTransactionsPerUser);

        // Test that categories are associated with transactions
        $transactionsWithCategories = $transactions->filter(fn ($transaction) => $transaction->category_id !== null);
        $this->assertCount($transactionsWithCategories->count(), $transactionsWithCategories);
    }

    /**
     * Test that the seeder can be run multiple times without duplicating data.
     */
    public function test_seeder_is_idempotent(): void
    {
        // First run
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);

        $initialUserCount = User::count();
        $initialTransactionCount = Transaction::count();

        // Second run
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);

        // The seeder should add more data on subsequent runs
        $this->assertGreaterThan($initialUserCount, User::count());
        $this->assertGreaterThan($initialTransactionCount, Transaction::count());
    }

    /**
     * Test that the seeder creates realistic financial data.
     */
    public function test_seeder_creates_realistic_financial_data(): void
    {
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);

        $transactions = Transaction::all();

        // Check that we have a mix of income and expenses
        $incomeTotal = $transactions->where('type', 'income')->sum('amount');
        $expenseTotal = $transactions->where('type', 'expense')->sum('amount');
        $liabilityTotal = $transactions->where('type', 'liability')->sum('amount');

        // We should have significant income and expense amounts
        $this->assertGreaterThan(100000, $incomeTotal); // Total income should be substantial
        $this->assertGreaterThan(50000, $expenseTotal);  // Total expenses should be substantial
        $this->assertGreaterThan(5000, $liabilityTotal); // Total liabilities should be present

        // Check date ranges (should be within 2026)
        $minDate = $transactions->min('transaction_date');
        $maxDate = $transactions->max('transaction_date');

        $this->assertStringContainsString('2026', $minDate);
        $this->assertStringContainsString('2026', $maxDate);
    }
}
