<?php

namespace App\Mail;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;

class MonthlyTransactionReport extends Mailable implements ShouldQueue
{
    use Queueable;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build(): self
    {
        $subject = 'Monthly Transaction Report – '.$this->data['month'];
        $view = 'emails.monthly-transaction-report';

        $pdf = Pdf::loadView($view, $this->data)
            ->setPaper('a4', 'landscape')
            ->output();
        $filename = 'monthly_transactions_'.str_replace(' ', '_', $this->data['month']).'.pdf';

        return $this->subject($subject)
            ->view($view)
            ->with($this->data)
            ->attachData($pdf, $filename, [
                'mime' => 'application/pdf',
            ]);
    }
}
