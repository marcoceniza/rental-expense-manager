<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\RecurringController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

/*---------------------------------------------------------------------------
| PUBLIC AUTHENTICATION
|---------------------------------------------------------------------------*/

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

Route::controller(AuthController::class)->group(function () {
    Route::post('/login', 'login');
    Route::post('/register', 'register');
});

Route::middleware('auth:sanctum')->group(function () {
    /*---------------------------------------------------------------------------
    | AUTHENTICATED USER
    |---------------------------------------------------------------------------*/

    Route::controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout');
        Route::get('/me', 'me');
        Route::patch('/me', 'updateProfile');
    });

    Route::middleware('admin')->controller(AdminController::class)->group(function () {
        Route::get('/users', 'users');
        Route::post('/users', 'createUser');
        Route::get('/logs', 'logs');
    });
    Route::middleware('admin')->controller(TransactionController::class)->group(function () {
        Route::get('/transactions/trash', 'trash');
        Route::patch('/transactions/{id}/restore', 'restore');
        Route::delete('/transactions/{id}/force-delete', 'forceDelete');
    });

    /*---------------------------------------------------------------------------
    | TRANSACTIONS
    |---------------------------------------------------------------------------*/

    Route::controller(TransactionController::class)->group(function () {
        Route::get('/transactions', 'index');
        Route::post('/transactions', 'store');
        Route::patch('/transactions/{transaction}', 'update');
        Route::delete('/transactions/{transaction}', 'destroy');
    });

    /*---------------------------------------------------------------------------
    | CATEGORIES
    |---------------------------------------------------------------------------*/

    Route::controller(CategoryController::class)->group(function () {
        Route::get('/categories', 'index');
        Route::post('/categories', 'store');
        Route::patch('/categories/{category}', 'update');
        Route::delete('/categories/{category}', 'destroy');
    });

    /*---------------------------------------------------------------------------
    | RECURRING
    |---------------------------------------------------------------------------*/

    Route::controller(RecurringController::class)->group(function () {
        Route::get('/recurring', 'index');
        Route::post('/recurring', 'store');
        Route::patch('/recurring/{recurring}', 'update');
        Route::delete('/recurring/{recurring}', 'destroy');
    });

    /*---------------------------------------------------------------------------
    | REPORTS
    |---------------------------------------------------------------------------*/

    Route::controller(ReportController::class)->group(function () {
        Route::get('/reports/dashboard', 'dashboard');
        Route::get('/reports/annual', 'annualReport');
        Route::get('/reports/charity', 'charityReport');
        Route::get('/reports/others', 'othersReport');
        Route::get('/reports/category-summary', 'categorySummary');
    });
});
