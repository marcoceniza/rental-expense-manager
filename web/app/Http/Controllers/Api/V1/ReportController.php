<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    public function dashboard(Request $request): JsonResponse
    {
        $month = $request->query('month') ?? now()->format('Y-m');
        [$year, $monthNum] = explode('-', $month);
        $monthDate = Carbon::create((int) $year, (int) $monthNum, 1);

        $start = $monthDate->copy()->startOfMonth();
        $end = $monthDate->copy()->endOfMonth();

        $categories = $request->user()->isAdmin()
            ? Category::all()
            : Category::where('is_other', false)->get();

        $monthlyReport = $this->buildMonthlyReport($start, $end);

        $transactions = Transaction::with(['category', 'user'])
            ->filtered($start, $end, $request->user())
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'month' => $monthDate->format('Y-m'),
            'categories' => $categories->map(fn ($category) => $this->formatCategory($category))->values()->all(),
            'monthly_report' => $monthlyReport,
            'transactions' => $transactions->map(fn ($transaction) => $this->formatTransaction($transaction))->values()->all(),
        ]);
    }

    public function annualReport(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', now()->year);

        $monthly = collect(range(1, 12))->map(function ($month) use ($year, $request) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $query = Transaction::filtered($start, $end, $request->user());

            $income = (clone $query)->where('type', 'income')->sum('amount');
            $expense = (clone $query)->where('type', 'expense')->sum('amount');
            $liability = (clone $query)->where('type', 'liability')->sum('amount');

            return [
                'month' => $start->format('F'),
                'income' => $income,
                'expense' => $expense,
                'liability' => $liability,
                'net' => $income - ($expense + $liability),
            ];
        });

        return response()->json([
            'monthly' => $monthly,
            'totals' => [
                'income' => $monthly->sum('income'),
                'expense' => $monthly->sum('expense'),
                'liability' => $monthly->sum('liability'),
                'net' => $monthly->sum('net'),
            ],
        ]);
    }

    public function charityReport(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', now()->year);

        $start = Carbon::create($year, 1, 1)->startOfYear();
        $end = Carbon::create($year, 12, 31)->endOfYear();

        $query = Transaction::with(['category', 'user'])
            ->filtered($start, $end, $request->user())
            ->where('type', 'expense')
            ->whereHas('category', function ($q) {
                $q->where('is_tuition', true);
            })
            ->orderByDesc('transaction_date');

        $transactions = $query->paginate(15);

        return response()->json([
            'expense' => (clone $query)->sum('amount'),
            'transactions' => $transactions->items(),
            'meta' => $this->paginate($transactions),
        ]);
    }

    public function othersReport(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', now()->year);

        $start = Carbon::create($year, 1, 1)->startOfYear();
        $end = Carbon::create($year, 12, 31)->endOfYear();

        $query = Transaction::with(['category', 'user'])
            ->filtered($start, $end, $request->user())
            ->where('type', 'income')
            ->whereHas('category', function ($q) {
                $q->where('is_other', true);
            })
            ->orderByDesc('transaction_date');

        $transactions = $query->paginate(15);

        return response()->json([
            'income' => (clone $query)->sum('amount'),
            'transactions' => $transactions->items(),
            'meta' => $this->paginate($transactions),
        ]);
    }

    private function buildMonthlyReport(Carbon $start, Carbon $end): array
    {
        $query = Transaction::filtered($start, $end, auth()->user());

        $income = (clone $query)->where('type', 'income')->sum('amount');
        $expense = (clone $query)->where('type', 'expense')->sum('amount');
        $liability = (clone $query)->where('type', 'liability')->sum('amount');

        return [
            'income' => $income,
            'expense' => $expense,
            'liability' => $liability,
            'net' => $income - ($expense + $liability),
        ];
    }

    public function categorySummary(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', now()->year);

        $start = Carbon::create($year, 1, 1)->startOfYear();
        $end = Carbon::create($year, 12, 31)->endOfYear();

        $query = Transaction::filtered($start, $end, $request->user());

        $categoryReport = $query->get()
            ->groupBy('category.name')
            ->map(function ($items, $categoryName) {
                $first = $items->first();

                return [
                    'name' => $categoryName,
                    'type' => $first->category->type ?? 'unknown',
                    'total' => $items->sum('amount'),
                ];
            })
            ->values();

        return response()->json([
            'categoryReport' => $categoryReport,
            'year' => $year,
        ]);
    }
}
