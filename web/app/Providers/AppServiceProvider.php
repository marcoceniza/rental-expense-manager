<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Transaction;
use App\Services\ActivityLogRecorder;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Transaction::created(fn (Transaction $transaction) => $this->recordModelActivity($transaction, 'created'));
        Transaction::updated(fn (Transaction $transaction) => $this->recordModelActivity($transaction, 'updated'));
        Transaction::deleted(fn (Transaction $transaction) => $this->recordModelActivity($transaction, 'deleted'));
        Transaction::restored(fn (Transaction $transaction) => $this->recordModelActivity($transaction, 'restored'));

        Category::created(fn (Category $category) => $this->recordModelActivity($category, 'created'));
        Category::updated(fn (Category $category) => $this->recordModelActivity($category, 'updated'));
        Category::deleted(fn (Category $category) => $this->recordModelActivity($category, 'deleted'));
        Category::restored(fn (Category $category) => $this->recordModelActivity($category, 'restored'));
    }

    private function recordModelActivity(Model $model, string $action): void
    {
        $payload = $action === 'updated' ? $model->getChanges() : $model->getAttributes();
        unset($payload['created_at'], $payload['updated_at']);

        app(ActivityLogRecorder::class)->record(
            $action,
            class_basename($model).' '.$action,
            Auth::user(),
            $model,
            $payload,
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
