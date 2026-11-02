<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['category_id', 'amount', 'frequency', 'start_date', 'description'])]
class Recurring extends Model
{
    /**
     * @property Carbon|null $end_date
     * @property Carbon|null $last_generated_at
     * @property-read Category|null $category
     */

    /**
     * @method \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Category> category()
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'last_generated_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
