<?php

namespace App\Http\Requests\Todo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['sometimes', 'string', 'min:1', 'max:255'],
            'status'  => ['sometimes', 'boolean'],
        ];
    }

    /**
     * After base validation passes, ensure at least one updatable field
     * was provided — an empty body has no effect and should be rejected.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$this->has('content') && !$this->has('status')) {
                $validator->errors()->add('content', 'At least one of content or status is required.');
                $validator->errors()->add('status', 'At least one of content or status is required.');
            }
        });
    }
}
