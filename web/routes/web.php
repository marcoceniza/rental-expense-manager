<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\Transactions\CategoryController;
use App\Http\Controllers\Transactions\RecurringController;
use App\Http\Controllers\Transactions\ReportController;
use App\Http\Controllers\Transactions\TransactionController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    DB::select('select 1');

    return response('ok', 200)->header('Content-Type', 'text/plain');
});

Route::middleware('guest')->group(function () {
    Route::inertia('/login', 'auth/Login')->name('login');
});

/*---------------------------------------------------------------------------
| USER ROUTES
---------------------------------------------------------------------------*/
Route::middleware('auth')->name('user.')->group(function () {
    Route::get('/dashboard', [ReportController::class, 'userDashboard'])->name('dashboard');
    Route::get('/reports', [ReportController::class, 'userAnnualReport'])->name('reports');
    Route::get('/transactions', [TransactionController::class, 'userTransactions'])->name('transactions');
    Route::get('/charity', [ReportController::class, 'userCharityReport'])->name('charity');
});

/*---------------------------------------------------------------------------
|| ADMIN ROUTES
---------------------------------------------------------------------------*/
Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [ReportController::class, 'index'])->name('dashboard');
        Route::get('/charity', [ReportController::class, 'charityIndex'])->name('charity');
        Route::get('/others', [ReportController::class, 'otherIndex'])->name('others');
        Route::get('/reports', [ReportController::class, 'annualReport'])->name('reports');
        Route::get('/create-user', [AdminUserController::class, 'create'])->name('create-user');
        Route::post('/create-user', [AdminUserController::class, 'store'])->name('create-user.store');
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::patch('categories/{id}/restore', [CategoryController::class, 'restore'])->name('categories.restore');
        Route::delete('categories/{id}/force-delete', [CategoryController::class, 'forceDelete'])->name('categories.force-delete');
        Route::patch('transactions/{id}/restore', [TransactionController::class, 'restore'])->name('transactions.restore');
        Route::delete('transactions/{id}/force-delete', [TransactionController::class, 'forceDelete'])->name('transactions.force-delete');
        Route::resource('recurring', RecurringController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/logs', [LogsController::class, 'index'])->name('logs');
    });

Route::fallback(function (Request $request): RedirectResponse {
    if ($request->expectsJson() || $request->user()) {
        abort(404);
    }

    return to_route('login');
});
