<?php

namespace App\Http\Controllers\Todo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Todo\StoreTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Todo;
use App\Services\Todo\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly TodoService $todoService) {}

    public function index(Request $request): JsonResponse
    {
        $todos = $this->todoService->getAll($request->query('filter'));

        return $this->success($todos);
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = $this->todoService->create(
            content: $request->validated('content'),
            status: $request->validated('status', false),
        );

        return $this->created($todo);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        $updated = $this->todoService->update($todo, $request->validated());

        return $this->success($updated);
    }

    public function destroy(Todo $todo): JsonResponse
    {
        $this->todoService->delete($todo);

        return $this->noContent();
    }
}
