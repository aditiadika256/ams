<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

class LoginRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 6 karakter',
        ];
    }
}

