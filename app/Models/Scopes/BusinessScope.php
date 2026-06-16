<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class BusinessScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply scope when authenticated as a tenant user (web guard)
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            if ($user && $user->business_id) {
                $builder->where($model->getTable().'.business_id', $user->business_id);
            }
        }
    }
}
