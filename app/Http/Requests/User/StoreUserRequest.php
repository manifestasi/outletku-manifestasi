<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('owner');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isCashier = $this->input('role') === 'cashier';

        return [
            'name' => ['required', 'string', 'max:100'],
            'role' => ['required', Rule::in(['owner', 'manager', 'cashier'])],
            'phone' => ['nullable', 'string', 'max:20'],
            'outlet_ids' => ['nullable', 'array'],
            'outlet_ids.*' => ['uuid', 'exists:outlets,id'],

            // For non-cashier (owner/manager): email & password required
            'email' => $isCashier
                ? ['nullable', 'string', 'email', 'max:255', 'unique:users']
                : ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $isCashier
                ? ['nullable', 'string', 'min:8']
                : ['required', 'string', 'min:8'],

            // For cashier: PIN required (6 digits)
            'pin' => $isCashier
                ? ['required', 'string', 'digits:6']
                : ['nullable', 'string', 'digits:6'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama user wajib diisi.',
            'role.required' => 'Role wajib dipilih.',
            'email.required' => 'Email wajib diisi untuk owner/manager.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Password wajib diisi untuk owner/manager.',
            'pin.required' => 'PIN wajib diisi untuk kasir.',
            'pin.digits' => 'PIN harus 6 digit angka.',
        ];
    }
}
