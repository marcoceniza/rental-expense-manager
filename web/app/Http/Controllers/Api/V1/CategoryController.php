<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Transactions\StoreCategoryRequest;
use App\Http\Requests\Transactions\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::withCount('transactions')->latest()->get();

        return response()->json([
            'data' => $categories->map(fn ($category) => $this->formatCategory($category))->values()->all(),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json(['data' => $this->formatCategory($category)], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json(['data' => $this->formatCategory($category)]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->transactions()->exists()) {
            return response()->json([
                'message' => 'Category is in use and cannot be deleted.',
            ], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
