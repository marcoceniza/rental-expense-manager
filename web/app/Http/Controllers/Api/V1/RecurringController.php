<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Transactions\StoreRecurringRequest;
use App\Models\Recurring;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $recurrings = Recurring::with('category')->get();

        return response()->json([
            'data' => $recurrings->map(fn ($recurring) => $this->formatRecurring($recurring))->values()->all(),
        ]);
    }

    public function store(StoreRecurringRequest $request): JsonResponse
    {
        $recurring = Recurring::create($request->validated());

        return response()->json(['data' => $this->formatRecurring($recurring)], 201);
    }

    public function update(StoreRecurringRequest $request, Recurring $recurring): JsonResponse
    {
        $recurring->update($request->validated());

        return response()->json(['data' => $this->formatRecurring($recurring)]);
    }

    public function destroy(Request $request, Recurring $recurring): JsonResponse
    {
        $recurring->delete();

        return response()->json(['message' => 'Recurring transaction deleted successfully.']);
    }

    private function formatRecurring(Recurring $recurring): array
    {
        return [
            'id' => $recurring->id,
            'category_id' => $recurring->category_id,
            'category' => $recurring->category ? $this->formatCategory($recurring->category) : null,
            'amount' => $recurring->amount,
            'frequency' => $recurring->frequency,
            'start_date' => $recurring->start_date->format('Y-m-d'),
            'end_date' => $recurring->end_date ? $recurring->end_date->format('Y-m-d') : null,
            'last_generated_at' => $recurring->last_generated_at ? $recurring->last_generated_at->toIso8601String() : null,
            'description' => $recurring->description,
            'created_at' => $recurring->created_at->toIso8601String(),
            'updated_at' => $recurring->updated_at->toIso8601String(),
        ];
    }
}
