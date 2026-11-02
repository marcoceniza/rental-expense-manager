<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'type', 'is_tuition', 'is_other'])]
class Category extends Model
{
    /**
     * @property-read Collection<int, Transaction> $transactions
     * @property-read Collection<int, Recurring> $recurringTransactions
     */
    use HasFactory, SoftDeletes;

    protected $casts = [
        'is_tuition' => 'boolean',
        'is_other' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function recurringTransactions()
    {
        return $this->hasMany(Recurring::class);
    }
}
