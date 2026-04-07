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
     *
     * Eloquent::create() returns the model on success or false when a model
     * event (e.g. `creating`) cancels the operation. We guard against that
     * so a cancelled creation never reaches the controller as a valid model.
     *
     * @throws \RuntimeException when creation is prevented by a model event
     */
    public function create(string $content, bool $status = false): Todo
    {
        $todo = Todo::create([
            'content' => $content,
            'status'  => $status,
        ]);

        // create() always returns a model instance (via tap), but if a model
        // event cancelled the save, exists will be false and no row was inserted.
        if (!$todo->exists) {
            throw new \RuntimeException('Todo could not be created.');
        }

        return $todo;
    }

    /**
     * Update only the fields that were supplied — partial updates are
     * intentional so the frontend can toggle status without sending content.
     *
     * Eloquent::update() returns false when a model event (e.g. `updating`)
     * cancels the save. We treat that as a server-side failure.
     *
     * @throws \RuntimeException when update is prevented by a model event
     */
    public function update(Todo $todo, array $data): Todo
    {
        if ($todo->update($data) === false) {
            throw new \RuntimeException("Todo #{$todo->id} could not be updated.");
        }

        return $todo->fresh();
    }

    /**
     * Permanently remove the todo from storage.
     *
     * Eloquent's delete() returns bool|null — false means a model event
     * prevented the deletion. We treat that as a server-side failure rather
     * than silently returning 204 to the client.
     *
     * @throws \RuntimeException when deletion is prevented by a model event
     */
    public function delete(Todo $todo): void
    {
        if ($todo->delete() === false) {
            throw new \RuntimeException("Todo #{$todo->id} could not be deleted.");
        }
    }
}
