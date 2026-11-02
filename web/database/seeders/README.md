# Database Seeder Documentation

This document describes the comprehensive database seeding functionality for the Rental Expense Manager application.

## Overview

The `DatabaseSeeder.php` file provides realistic sample data to populate the application's database for development, testing, and demonstration purposes. It creates a diverse set of users, categories, transactions, and recurring transactions.

## Features

### User Generation

- **5 users** with mixed roles:
    - 1 admin user (`Sarah Johnson`)
    - 4 regular users (`Mike Chen`, `Emily Davis`, `Robert Wilson`, `Lisa Anderson`)
- Each user receives a secure, hashed password
- Realistic email addresses

### Category Creation

- **15 categories** covering all transaction types:
    - **Income**: Salary, Freelance, Investment Returns
    - **Expense**: Rent, Utilities, Groceries, Transportation, Dining Out, Healthcare
    - **Liability**: Loan Payment, Credit Card, Mortgage
    - **Special**: Tuition Fees, Other Income/Expenses

### Transaction Generation

- **Sample transactions** distributed across all users:
    - **Income transactions**: Monthly salaries, freelance payments, bonuses
    - **Expense transactions**: Bills, groceries, entertainment, healthcare
    - **Liability transactions**: Loan and credit card payments
- **Random additional transactions**: 2-4 extra transactions per user for variety
- **Realistic amounts**: From $100 to $52,000
- **Diverse dates**: Spanning January to March 2026
- **Rich descriptions**: Meaningful transaction descriptions

### Recurring Transactions

- **5 recurring transactions**:
    - Monthly salary payment
    - Monthly rent
    - Monthly utilities
    - Monthly internet service
    - Weekly gas expense

## Usage

### Running the Seeder

To populate the database with sample data, run:

```bash
php artisan db:seed
```

Or specifically seed the database:

```bash
php artisan db:seed --class=DatabaseSeeder
```

### Testing the Seeder

To test the seeder functionality without affecting production data:

```bash
php artisan db:seed --class=DatabaseSeeder --env=testing
```

### Reset and Seed

To completely reset the database and recreate it with sample data:

```bash
php artisan migrate:refresh && php artisan db:seed
```

## Sample Data Overview

### Users Created

- **Total Users**: 5
- **Admin Users**: 1 (Sarah Johnson)
- **Regular Users**: 4
- **Email Domains**: example.com

### Categories Created

- **Total Categories**: 15
- **Income Categories**: 3
- **Expense Categories**: 6
- **Liability Categories**: 3
- **Special Categories**: 3 (tuition, other income, other expenses)

### Transactions Created

- **Sample Transactions**: ~15-20 (5 users × 3-5 each)
- **Random Transactions**: 10-20 (5 users × 2-4 each)
- **Recurring Transactions**: 5
- **Total Transactions**: ~30-45

## Data Quality Features

1. **Realistic Amounts**: Financial amounts that make sense in real life
2. **Diverse User Types**: Mix of admin and regular users
3. **Complete Category Coverage**: All transaction types represented
4. **Temporal Distribution**: Transactions spread across multiple months
5. **Variety**: Mix of planned (recurring) and spontaneous (random) transactions
6. **Security**: Passwords are properly hashed
7. **Uniqueness**: Unique email addresses for each user

## Testing Benefits

This seeder provides excellent test data for:

- **User interface testing**: Real-looking user data
- **Financial calculations**: Realistic income/expense patterns
- **Reporting features**: Diverse transaction data for reports
- **Security testing**: Different user roles and permissions
- **Performance testing**: Sufficient data volume for load testing
- **Feature validation**: All category types and transaction scenarios

## Customization

You can modify the `$categoryTypes`, `$sampleTransactions`, and `$sampleRecurring` arrays to:

- Adjust the number of users
- Change transaction amounts
- Update category names
- Add new transaction types
- Modify date ranges
- Adjust frequency patterns

## Dependencies

This seeder requires:

- `php artisan migrate` to be run first (to create necessary tables)
- A working database connection
- Laravel's `fake()` function (Laravel 10+)

## Notes

- All passwords are securely hashed using Laravel's `Hash::make()`
- Email addresses are unique and follow standard email format
- Transaction amounts are formatted with 2 decimal places
- The seeder is idempotent and can be run multiple times
- Random transactions use Laravel's built-in Faker library for realistic data
