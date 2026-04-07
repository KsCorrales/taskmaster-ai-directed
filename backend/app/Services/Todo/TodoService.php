<?php

namespace App\Services\Todo;

use App\Models\Todo;
use Illuminate\Database\Eloquent\Collection;

class TodoService
{
    /**
     * Return all todos newest first, optionally filtered by status.
     *
     * Accepted filter values: 'active' (status=false), 'completed' (status=true).
     * Any other value (including null / 'all') returns everything.
     */
    public function getAll(?string $filter): Collection
    {
        $query = Todo::query()->latest();

        if ($filter === 'active') {
            $query->where('status', false);
        } elseif ($filter === 'completed') {
            $query->where('status', true);
        }

        return $query->get();
    }

    /**
     * Persist a new todo. Status defaults to false when not supplied.
     */
    public function create(string $content, bool $status = false): Todo
    {
        return Todo::create([
            'content' => $content,
            'status'  => $status,
        ]);
    }

    /**
     * Update only the fields that were supplied — partial updates are
     * intentional so the frontend can toggle status without sending content.
     */
    public function update(Todo $todo, array $data): Todo
    {
        $todo->update($data);

        return $todo->fresh();
    }

    /**
     * Permanently remove the todo from storage.
     */
    public function delete(Todo $todo): void
    {
        $todo->delete();
    }
}
