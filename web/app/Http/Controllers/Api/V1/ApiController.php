<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class ApiController extends Controller
{
    /**
     * Format a single category for JSON response.
     */
    /**
     * @param object $category
     * @return array{id: int, name: string, type: string, is_tuition: bool, is_other: bool}
     */
    protected function formatCategory(object $category): array
    {
        /** @var Category $category */
        return [
            'id' => $category->id,
            'name' => $category->name,
            'type' => $category->type,
            'is_tuition' => $category->is_tuition,
            'is_other' => $category->is_other,
            'transactions_count' => (int) ($category->transactions_count ?? 0),
        ];
    }

    /**
     * Format a single user for JSON response.
     */
    /**
     * @param object $user
     * @return array{id: int, name: string, email: string, user_type: string}
     */
    protected function formatUser(object $user): array
    {
        /** @var User $user */
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
        ];
    }

    /**
     * Format a single transaction for JSON response.
     */
    /**
     * @param Transaction $transaction
     * @return array{id: int, user_id: int, category_id: int, type: string, amount: string, transaction_date: string, is_recurring_generated: bool, created_at: string, updated_at: string, category: array{id: int, name: string, type: string, is_tuition: bool, is_other: bool}|null, user: array{id: int, name: string, email: string, user_type: string}|null}
     */
    protected function formatTransaction(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'user_id' => $transaction->user_id,
            'category_id' => $transaction->category_id,
            'type' => $transaction->type,
            'amount' => $transaction->amount,
            'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
            'description' => $transaction->description,
            'remarks' => $transaction->remarks,
            'recurring_id' => $transaction->recurring_id,
            'is_recurring_generated' => $transaction->is_recurring_generated,
            'created_at' => $transaction->created_at->toIso8601String(),
            'updated_at' => $transaction->updated_at->toIso8601String(),
            'deleted_at' => $transaction->deleted_at?->toIso8601String(),
            'category' => $transaction->category ? $this->formatCategory($transaction->category) : null,
            'user' => $transaction->user ? $this->formatUser($transaction->user) : null,
        ];
    }

    /**
     * @param LengthAwarePaginator<int, mixed> $paginator
     * @return array<string, mixed>
     */
    protected function paginate(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
        ];
    }
}
