<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Monthly Transaction Report - {{ $month }}</title>
    <style>
        @page { margin: 28px 32px; }
        body { color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 10px; }
        .header { border-bottom: 2px solid #1d4ed8; margin-bottom: 18px; padding-bottom: 12px; }
        .brand { color: #1d4ed8; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        h1 { color: #111827; font-size: 20px; margin: 7px 0 3px; }
        .period { color: #6b7280; font-size: 11px; margin: 0; }
        .summary { border-collapse: separate; border-spacing: 7px 0; margin: 0 -7px 18px; width: 100%; }
        .summary td { background: #f3f4f6; border-radius: 4px; padding: 10px; vertical-align: top; width: 25%; }
        .summary-label { color: #6b7280; display: block; font-size: 8px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
        .summary-value { color: #111827; font-size: 12px; font-weight: bold; }
        h2 { color: #111827; font-size: 13px; margin: 18px 0 8px; }
        .transactions { border-collapse: collapse; width: 100%; }
        .transactions thead { display: table-header-group; }
        .transactions tr { page-break-inside: avoid; }
        .transactions th { background: #1f2937; color: #fff; font-size: 8px; padding: 7px 6px; text-align: left; }
        .transactions td { border-bottom: 1px solid #e5e7eb; padding: 6px; vertical-align: top; }
        .transactions .amount { text-align: right; white-space: nowrap; }
        .empty { color: #6b7280; padding: 18px 6px !important; text-align: center; }
        .footer { border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 8px; margin-top: 18px; padding-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <span class="brand">Rental Expense Manager</span>
        <h1>Monthly Transaction Report</h1>
        <p class="period">{{ $month }}</p>
    </div>

    <table class="summary">
        <tbody>
            <tr>
                <td>
                    <span class="summary-label">Income</span>
                    <span class="summary-value">PHP {{ number_format((float) ($totals['income'] ?? 0), 2) }}</span>
                </td>
                <td>
                    <span class="summary-label">Expenses</span>
                    <span class="summary-value">PHP {{ number_format((float) ($totals['expense'] ?? 0), 2) }}</span>
                </td>
                <td>
                    <span class="summary-label">Liabilities</span>
                    <span class="summary-value">PHP {{ number_format((float) ($totals['liability'] ?? 0), 2) }}</span>
                </td>
                <td>
                    <span class="summary-label">Transactions</span>
                    <span class="summary-value">{{ $transactions->count() }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <p>
        Recurring: {{ $recurring_count }}
        &nbsp; | &nbsp;
        Non-recurring: {{ $non_recurring_count }}
    </p>

    <h2>Transactions</h2>
    <table class="transactions">
        <thead>
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th class="amount">Amount (PHP)</th>
                <th>Recurring</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $transaction)
                <tr>
                    <td>{{ $transaction->id }}</td>
                    <td>{{ $transaction->transaction_date->format('Y-m-d') }}</td>
                    <td>{{ $transaction->description }}</td>
                    <td>{{ $transaction->category?->name ?? 'N/A' }}</td>
                    <td>{{ ucfirst($transaction->type) }}</td>
                    <td class="amount">{{ number_format((float) $transaction->amount, 2) }}</td>
                    <td>{{ $transaction->is_recurring_generated ? 'Yes' : 'No' }}</td>
                </tr>
            @empty
                <tr>
                    <td class="empty" colspan="7">No transactions were recorded for this month.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Generated for {{ $month }}.</div>
</body>
</html>
