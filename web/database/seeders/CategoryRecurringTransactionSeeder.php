<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Recurring;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CategoryRecurringTransactionSeeder extends Seeder
{
    /**
     * Seed the categories, recurrings, and transactions tables only.
     *
     * Users are created as supporting data so transactions can reference valid user_id values.
     */
    public function run(): void
    {
        $this->createUsers();
        $categories = $this->createCategories();
        $recurrings = $this->createRecurrings($categories);
        $this->createTransactions($categories, $recurrings);
    }

    /** @return Collection<int, Category> */
    private function createCategories(): Collection
    {
        $categoryTypes = [
            ['type' => 'income', 'name' => 'Salary', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'income', 'name' => 'Freelance', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'income', 'name' => 'Investment Returns', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Rent', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Utilities', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Groceries', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Transportation', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Dining Out', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'expense', 'name' => 'Healthcare', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'liability', 'name' => 'Loan Payment', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'liability', 'name' => 'Credit Card', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'liability', 'name' => 'Mortgage', 'is_tuition' => false, 'is_other' => false],
            ['type' => 'tuition', 'name' => 'Tuition Fees', 'is_tuition' => true, 'is_other' => false],
            ['type' => 'other', 'name' => 'Other Income', 'is_tuition' => false, 'is_other' => true],
            ['type' => 'other', 'name' => 'Other Expenses', 'is_tuition' => false, 'is_other' => true],
        ];

        $categories = Category::factory()->count(count($categoryTypes))->create();

        foreach ($categoryTypes as $index => $categoryType) {
            $categories[$index]->update([
                'name' => $categoryType['name'],
                'type' => $categoryType['type'],
                'is_tuition' => $categoryType['is_tuition'] ?? false,
                'is_other' => $categoryType['is_other'] ?? false,
            ]);
        }

        return $categories;
    }

    /** @param  Collection<int, Category>  $categories */
    private function createRecurrings(Collection $categories): array
    {
        $sampleRecurring = [
            ['category_type' => 'income', 'amount' => 45000.00, 'frequency' => 'monthly', 'start_date' => '2026-01-01', 'description' => 'Monthly salary'],
            ['category_type' => 'expense', 'amount' => 1800.00, 'frequency' => 'monthly', 'start_date' => '2026-01-01', 'description' => 'Rent'],
            ['category_type' => 'expense', 'amount' => 1800.00, 'frequency' => 'monthly', 'start_date' => '2026-01-15', 'description' => 'Utilities'],
            ['category_type' => 'expense', 'amount' => 1200.00, 'frequency' => 'monthly', 'start_date' => '2026-01-05', 'description' => 'Internet service'],
            ['category_type' => 'expense', 'amount' => 500.00, 'frequency' => 'weekly', 'start_date' => '2026-01-03', 'description' => 'Gas expense'],
        ];

        $recurrings = [];
        foreach ($sampleRecurring as $rec) {
            $matchingCategories = $categories->where('type', $rec['category_type']);
            if ($matchingCategories->isEmpty()) {
                $matchingCategories = $categories->where('type', 'expense');
            }

            $category = $matchingCategories->random();

            $recurrings[] = Recurring::create([
                'category_id' => $category->id,
                'amount' => $rec['amount'],
                'frequency' => $rec['frequency'],
                'start_date' => $rec['start_date'],
                'description' => $rec['description'],
            ]);
        }

        return $recurrings;
    }

    /** @param  Collection<int, Category>  $categories */
    /** @param  array<int, Recurring>  $recurrings */
    private function createTransactions(Collection $categories, array $recurrings): void
    {
        $users = User::all();
        $allCategories = Category::all();

        $sampleTransactions = [
            // Income transactions
            ['date' => '2026-01-05', 'amount' => 45000.00, 'description' => 'January Salary', 'category_type' => 'income'],
            ['date' => '2026-01-08', 'amount' => 12500.00, 'description' => 'Freelance project payment', 'category_type' => 'income'],
            ['date' => '2026-01-15', 'amount' => 2500.00, 'description' => 'Bonus payment', 'category_type' => 'income'],
            ['date' => '2026-02-03', 'amount' => 52000.00, 'description' => 'February Salary', 'category_type' => 'income'],
            ['date' => '2026-02-10', 'amount' => 8000.00, 'description' => 'Investment return', 'category_type' => 'income'],
            ['date' => '2026-03-05', 'amount' => 48000.00, 'description' => 'March Salary', 'category_type' => 'income'],
            ['date' => '2026-03-12', 'amount' => 3000.00, 'description' => 'Side hustle income', 'category_type' => 'income'],

            // Expense transactions
            ['date' => '2026-01-10', 'amount' => 3200.00, 'description' => 'Electricity bill', 'category_type' => 'expense'],
            ['date' => '2026-01-12', 'amount' => 2800.00, 'description' => 'Internet bill', 'category_type' => 'expense'],
            ['date' => '2026-01-15', 'amount' => 1800.00, 'description' => 'Grocery shopping', 'category_type' => 'expense'],
            ['date' => '2026-01-20', 'amount' => 2100.00, 'description' => 'Transportation', 'category_type' => 'expense'],
            ['date' => '2026-02-05', 'amount' => 3500.00, 'description' => 'Restaurant dinner', 'category_type' => 'expense'],
            ['date' => '2026-02-11', 'amount' => 2500.00, 'description' => 'Water bill', 'category_type' => 'expense'],
            ['date' => '2026-02-25', 'amount' => 1500.00, 'description' => 'Medical expenses', 'category_type' => 'expense'],
            ['date' => '2026-03-08', 'amount' => 4200.00, 'description' => 'Car maintenance', 'category_type' => 'expense'],
            ['date' => '2026-03-15', 'amount' => 3600.00, 'description' => 'Internet bill', 'category_type' => 'expense'],
            ['date' => '2026-03-18', 'amount' => 2400.00, 'description' => 'Grocery shopping', 'category_type' => 'expense'],
            ['date' => '2026-03-22', 'amount' => 1200.00, 'description' => 'Movie tickets', 'category_type' => 'expense'],
            ['date' => '2026-03-28', 'amount' => 5000.00, 'description' => 'Monthly rent', 'category_type' => 'expense'],

            // Liability transactions
            ['date' => '2026-01-02', 'amount' => 800.00, 'description' => 'Loan payment', 'category_type' => 'liability'],
            ['date' => '2026-02-01', 'amount' => 1500.00, 'description' => 'Credit card payment', 'category_type' => 'liability'],
            ['date' => '2026-03-01', 'amount' => 2000.00, 'description' => 'Mortgage payment', 'category_type' => 'liability'],
        ];

        $transactionIndex = 0;
        foreach ($users as $user) {
            $transactionsForUser = array_slice($sampleTransactions, $transactionIndex, 5);
            $transactionIndex += 5;

            foreach ($transactionsForUser as $i => $transaction) {
                $matchingCategories = $categories->where('type', $transaction['category_type'] ?? 'expense');
                if ($matchingCategories->isEmpty()) {
                    $matchingCategories = $categories->where('type', 'expense');
                }

                $selectedCategory = $matchingCategories->random();

                Transaction::factory()->create([
                    'user_id' => $user->id,
                    'category_id' => $selectedCategory->id,
                    'type' => $transaction['category_type'] ?? $selectedCategory->type,
                    'amount' => $transaction['amount'],
                    'transaction_date' => $transaction['date'],
                    'description' => $transaction['description'],
                    'remarks' => fake()->optional()->sentence(),
                    'is_recurring_generated' => false,
                ]);
            }
        }

        // Create some additional random transactions for variety
        foreach ($users as $user) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                Transaction::factory()->create([
                    'user_id' => $user->id,
                    'category_id' => $allCategories->random()->id,
                    'type' => fake()->randomElement(['income', 'expense', 'liability']),
                    'amount' => fake()->randomFloat(2, 100, 10000),
                    'transaction_date' => fake()->dateTimeBetween('2026-01-01', '2026-03-31')->format('Y-m-d'),
                    'description' => fake()->sentence(),
                    'remarks' => fake()->optional()->sentence(),
                    'is_recurring_generated' => false,
                ]);
            }
        }
    }

    private function createUsers(): void
    {
        $this->createUser([
            'name' => 'Sarah Johnson',
            'email' => 'sarah@example.com',
            'user_type' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        $this->createUser([
            'name' => 'Mike Chen',
            'email' => 'mike@example.com',
            'user_type' => 'user',
            'password' => Hash::make('user1234'),
        ]);
    }

    private function createUser(array $attributes): void
    {
        User::firstOrCreate(
            ['email' => $attributes['email']],
            $attributes
        );
    }
}
