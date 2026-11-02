<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\RecurringController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

/*---------------------------------------------------------------------------
| PUBLIC AUTHENTICATION
|---------------------------------------------------------------------------*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    /*---------------------------------------------------------------------------
    | AUTHENTICATED USER
    |---------------------------------------------------------------------------*/

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);

    /*---------------------------------------------------------------------------
    | TRANSACTIONS
    |---------------------------------------------------------------------------*/

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::patch('/transactions/{transaction}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
    Route::patch('/transactions/{id}/restore', [TransactionController::class, 'restore']);
    Route::delete('/transactions/{id}/force-delete', [TransactionController::class, 'forceDelete']);

    /*---------------------------------------------------------------------------
    | CATEGORIES
    |---------------------------------------------------------------------------*/

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    /*---------------------------------------------------------------------------
    | RECURRING
    |---------------------------------------------------------------------------*/

    Route::get('/recurring', [RecurringController::class, 'index']);
    Route::post('/recurring', [RecurringController::class, 'store']);
    Route::patch('/recurring/{recurring}', [RecurringController::class, 'update']);
    Route::delete('/recurring/{recurring}', [RecurringController::class, 'destroy']);

    /*---------------------------------------------------------------------------
    | REPORTS
    |---------------------------------------------------------------------------*/

    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/annual', [ReportController::class, 'annualReport']);
    Route::get('/reports/charity', [ReportController::class, 'charityReport']);
    Route::get('/reports/others', [ReportController::class, 'othersReport']);
});
