<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:150'],
            'category_id'   => ['nullable', 'uuid', 'exists:categories,id'],
            'sku'           => ['nullable', 'string', 'max:50'],
            'unit'          => ['required', 'string', 'max:20'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price'    => ['required', 'numeric', 'min:0'],
            'image'         => ['nullable', 'image', 'max:2048'],
            'is_active'     => ['boolean'],
        ];
    }
}
