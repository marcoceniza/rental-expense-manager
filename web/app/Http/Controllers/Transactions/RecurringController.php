<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transactions\StoreRecurringRequest;
use App\Models\Recurring;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RecurringController extends Controller
{
    /**
     * Display recurring transactions
     */
    public function index(): Response
    {
        return Inertia::render('transactions/Recurring', [
            'recurringTransactions' => Recurring::with('category')->get(),
            'categories' => Transaction::recurringCategoryOptions(),
        ]);
    }

    /**
     * Store recurring transaction
     */
    public function store(StoreRecurringRequest $request): RedirectResponse
    {
        Recurring::create($request->validated());

        return back()->with('success', 'Recurring created successfully.');
    }

    /**
     * Update recurring transaction
     */
    public function update(StoreRecurringRequest $request, Recurring $recurring): RedirectResponse
    {
        $recurring->update($request->validated());

        return back()->with('success', 'Recurring updated successfully.');
    }

    /**
     * Delete recurring transaction
     */
    public function destroy(Recurring $recurring): RedirectResponse
    {
        $recurring->delete();

        return back()->with('success', 'Recurring deleted successfully.');
    }
}
