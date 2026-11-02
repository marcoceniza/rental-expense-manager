<?php

namespace App\Console\Commands;

use App\Mail\MonthlyTransactionReport;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendMonthlyTransactionReport extends Command
{
    /**
     * Command signature
     */
    protected $signature = 'send-monthly-transaction-report';

    /**
     * Command description
     */
    protected $description = 'Send a monthly email report of all transactions';

    public function handle(): int
    {
        $now = Carbon::now('Asia/Manila');
        $first = $now->copy()->startOfMonth();
        $last = $now->copy()->endOfMonth();

        $transactions = Transaction::query()
            ->whereBetween('transaction_date', [$first, $last])
            ->with('category')
            ->get();

        $totals = $transactions->groupBy('type')->map(function ($group) {
            return $group->sum('amount');
        });

        $recurringCount = $transactions->where('is_recurring_generated', true)->count();
        $nonRecurringCount = $transactions->where('is_recurring_generated', false)->count();

        $recipients = $this->parseRecipients(
            config('services.monthly_report_email')
        );

        if ($recipients === []) {
            $this->error('MONTHLY_REPORT_EMAIL not configured. Aborting.');

            return self::FAILURE;
        }

        Mail::to($recipients)->send(new MonthlyTransactionReport([
            'month' => $now->format('F Y'),
            'transactions' => $transactions,
            'totals' => $totals,
            'recurring_count' => $recurringCount,
            'non_recurring_count' => $nonRecurringCount,
        ]));

        $this->info('Monthly transaction report sent to '.implode(', ', $recipients));

        return self::SUCCESS;
    }

    /**
     * Parse a comma-separated recipient list into a clean array of addresses.
     *
     * Accepts plain addresses ("a@example.com, b@example.com") as well as
     * named addresses ("Name <a@example.com>"); surrounding whitespace is
     * trimmed and empty entries are dropped.
     *
     * @return array<int, string>
     */
    protected function parseRecipients(?string $raw): array
    {
        if ($raw === null || trim($raw) === '') {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', explode(',', $raw)),
            static fn (string $email): bool => $email !== ''
        ));
    }
}
