<?php

namespace Tests\Feature;

use App\Mail\MonthlyTransactionReport;
use App\Models\Category;
use App\Models\Recurring;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;
use Tests\TestCase;

class SendMonthlyTransactionReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_queues_a_monthly_report_with_correct_data()
    {
        Mail::fake();
        // Set recipient
        config(['services.monthly_report_email' => 'test@example.com']);

        $today = now();

        $category = Category::factory()->create();
        $recurring = Recurring::create([
            'category_id' => $category->id,
            'amount' => 100.00,
            'frequency' => 'monthly',
            'start_date' => now(),
            'description' => 'Test recurring',
        ]);
        Transaction::factory()->create([
            'recurring_id' => $recurring->id,
            'transaction_date' => $today,
            'is_recurring_generated' => true,
        ]);

        Transaction::factory()->create([
            'transaction_date' => $today,
            'is_recurring_generated' => false,
        ]);

        Artisan::call('send-monthly-transaction-report');

        Mail::assertQueued(MonthlyTransactionReport::class, function ($mail) {
            return $mail->hasTo('test@example.com')
                && $mail->data['transactions']->count() === 2
                && $mail->data['recurring_count'] === 1
                && $mail->data['non_recurring_count'] === 1;
        });
        Mail::assertQueuedCount(1);
    }

    public function test_it_sends_the_monthly_report_to_multiple_recipients(): void
    {
        Mail::fake();
        config(['services.monthly_report_email' => 'a@example.com,  b@example.com, ']);

        Transaction::factory()->create([
            'transaction_date' => now(),
        ]);

        Artisan::call('send-monthly-transaction-report');

        $mail = null;
        Mail::assertQueued(MonthlyTransactionReport::class, function ($m) use (&$mail) {
            $mail = $m;

            return $m->hasTo('a@example.com')
                && $m->hasTo('b@example.com');
        });

        $this->assertCount(2, $mail->to);
    }

    public function test_it_aborts_when_no_recipient_is_configured(): void
    {
        Mail::fake();
        config(['services.monthly_report_email' => '']);

        Transaction::factory()->create([
            'transaction_date' => now(),
        ]);

        $exitCode = Artisan::call('send-monthly-transaction-report');

        $this->assertSame(Command::FAILURE, $exitCode);
        Mail::assertNotSent(MonthlyTransactionReport::class);
    }

    public function test_monthly_report_includes_the_full_last_day_only()
    {
        $this->travelTo(Carbon::parse('2026-06-30 23:55:00', 'Asia/Manila'));
        Mail::fake();
        config(['services.monthly_report_email' => 'test@example.com']);

        $category = Category::factory()->create();
        $lastDayTransaction = Transaction::factory()->create([
            'category_id' => $category->id,
            'transaction_date' => '2026-06-30',
        ]);
        DB::table('transactions')
            ->where('id', $lastDayTransaction->id)
            ->update(['transaction_date' => '2026-06-30 23:59:59']);

        Transaction::factory()->create([
            'category_id' => $category->id,
            'transaction_date' => '2026-07-01',
        ]);

        Artisan::call('send-monthly-transaction-report');

        Mail::assertQueued(MonthlyTransactionReport::class, function ($mail) use ($lastDayTransaction) {
            return $mail->data['transactions']->modelKeys() === [$lastDayTransaction->id];
        });
    }

    public function test_monthly_report_attaches_a_generated_pdf(): void
    {
        $category = Category::factory()->create();
        $transaction = Transaction::factory()->create([
            'category_id' => $category->id,
            'transaction_date' => '2026-06-15',
        ]);
        $mailable = new MonthlyTransactionReport([
            'month' => 'June 2026',
            'transactions' => collect([$transaction]),
            'totals' => collect(['expense' => $transaction->amount]),
            'recurring_count' => 0,
            'non_recurring_count' => 1,
        ]);

        try {
            $emailHtml = $mailable->render();
            $attachment = $mailable->rawAttachments[0] ?? null;

            $this->assertStringContainsString('Monthly Transaction Report', $emailHtml);
            $this->assertNotNull($attachment);
            $this->assertSame('monthly_transactions_June_2026.pdf', $attachment['name']);
            $this->assertSame('application/pdf', $attachment['options']['mime']);
            $this->assertStringStartsWith('%PDF-', $attachment['data']);
        } finally {
            foreach ($mailable->attachments as $attachment) {
                $path = $attachment['file'];

                if (is_file($path)) {
                    unlink($path);
                }

                $temporaryPath = str_ends_with($path, '.csv') ? substr($path, 0, -4) : null;

                if ($temporaryPath && is_file($temporaryPath)) {
                    unlink($temporaryPath);
                }
            }
        }
    }

    public function test_monthly_report_is_scheduled_for_the_last_day_of_the_month()
    {
        $reportEvent = collect(Schedule::events())->first(
            fn ($event) => str_contains($event->command, 'send-monthly-transaction-report')
        );

        expect($reportEvent)->not->toBeNull();
        expect($reportEvent->getExpression())->toBe(sprintf('55 23 %d * *', now()->endOfMonth()->day));
        expect($reportEvent->timezone)->toBe('Asia/Manila');
    }
}
