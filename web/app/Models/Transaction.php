<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

#[Fillable(['user_id', 'category_id', 'type', 'amount', 'transaction_date', 'description', 'remarks', 'recurring_id', 'is_recurring_generated'])]
class Transaction extends Model
{
    /**
     * @property-read Category|null $category
     * @property-read User|null $user
     */

    /**
     * @method \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\User> user()
     * @method \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Category> category()
     */
    use HasFactory, SoftDeletes;

    protected $casts = [
        'transaction_date' => 'date',
        'is_recurring_generated' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeFiltered($query, $start = null, $end = null, $user = null)
    {
        $user = $user ?? auth()->user();

        $query->with(['category', 'user']);

        if ($start && $end) {
            $query->whereBetween('transaction_date', [$start, $end]);
        }

        if (! $user->isAdmin()) {
            $query->whereHas('category', function ($q) {
                $q->where('is_other', false);
            });
        }

        return $query;
    }

    public static function recurringCategoryOptions(): Collection
    {
        return self::with('category')
            ->orderByDesc('transaction_date')
            ->get()
            ->filter(fn ($transaction) => $transaction->category)
            ->groupBy(fn ($transaction) => $transaction->category_id)
            ->map(function ($transactions) {
                $category = $transactions->first()->category;

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type,
                    'transaction_descriptions' => $transactions
                        ->map(fn ($transaction) => [
                            'description' => $transaction->description,
                            'amount' => $transaction->amount,
                        ])
                        ->unique(fn ($transaction) => $transaction['description'])
                        ->values(),
                ];
            })
            ->values();

    }
}
