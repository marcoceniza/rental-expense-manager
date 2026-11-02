<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transactions\StoreCategoryRequest;
use App\Http\Requests\Transactions\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories
     */
    public function index(): Response
    {
        return Inertia::render('transactions/Categories', [
            'categories' => Category::withCount('transactions')->latest()->get(),
        ]);
    }

    /**
     * Store a newly created category
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Update category
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Delete category
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->transactions()->exists()) {
            return back()->with('error', 'Category is in use and cannot be deleted.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    /**
     * Restore category
     */
    public function restore(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category restored successfully.');
    }

    /**
     * Force delete category
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);

        if ($category->transactions()->exists()) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Category has transactions.');
        }

        $category->forceDelete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category permanently deleted.');
    }
}
