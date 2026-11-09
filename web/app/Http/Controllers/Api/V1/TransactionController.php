<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Transactions\StoreTransactionRequest;
use App\Http\Requests\Transactions\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $type = $request->query('type');

        $query = Transaction::with(['category', 'user'])
            ->whereHas('category', function ($q) {
                $q->where('is_tuition', false)->where('is_other', false);
            })
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at');

        if ($request->user() && ! $request->user()->isAdmin()) {
            $query->whereHas('category', function ($q) {
                $q->where('is_other', false);
            });
        }

        if ($type && in_array($type, ['income', 'expense', 'liability'], true)) {
            $query->where('type', $type);
        }

        if ($month && is_numeric($month) && ((int) $month >= 1 && (int) $month <= 12)) {
            $query->whereMonth('transaction_date', (int) $month);
        }

        $transactions = $query->paginate(15);

        return response()->json([
            'data' => $transactions->map(fn ($transaction) => $this->formatTransaction($transaction))->values()->all(),
            'meta' => $this->paginate($transactions),
        ]);
    }

    public function trash(): JsonResponse
    {
        $transactions = Transaction::onlyTrashed()
            ->with(['category', 'user'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'data' => $transactions->map(fn ($transaction) => $this->formatTransaction($transaction))->values()->all(),
            'meta' => $this->paginate($transactions),
        ]);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = Transaction::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $this->formatTransaction($transaction)], 201);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $transaction->update($request->validated());

        return response()->json(['data' => $this->formatTransaction($transaction)]);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully.']);
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::withTrashed()->where('id', $id)->firstOrFail();
        $transaction->restore();

        return response()->json(['data' => $this->formatTransaction($transaction)]);
    }

    public function forceDelete(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::withTrashed()->where('id', $id)->firstOrFail();
        $transaction->forceDelete();

        return response()->json(['message' => 'Transaction permanently deleted.']);
    }
}
