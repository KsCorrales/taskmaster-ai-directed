<?php

namespace Tests\Feature\Todo;

use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoApiTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // GET /api/todos
    // -------------------------------------------------------------------------

    /**
     * When no todos exist the response must still be a valid empty array,
     * not null or a 404 — the resource collection always exists.
     */
    public function test_get_todos_returns_empty_array_when_no_todos_exist(): void
    {
        $response = $this->getJson('/api/todos');

        $response->assertOk()
                 ->assertExactJson([]);
    }

    /**
     * The list must come back newest-first so the user sees the most recently
     * added tasks at the top without any client-side sorting.
     */
    public function test_get_todos_returns_all_todos_ordered_newest_first(): void
    {
        $first  = Todo::factory()->create(['content' => 'First task',  'created_at' => now()->subSecond()]);
        $second = Todo::factory()->create(['content' => 'Second task', 'created_at' => now()]);

        $response = $this->getJson('/api/todos');

        $response->assertOk()
                 ->assertJsonCount(2)
                 ->assertJsonPath('0.id', $second->id)
                 ->assertJsonPath('1.id', $first->id);
    }

    /**
     * Each returned todo must expose the four fields the client needs.
     * Unexpected extra fields are fine; missing ones break the UI.
     */
    public function test_get_todos_response_items_have_correct_structure(): void
    {
        Todo::factory()->create();

        $this->getJson('/api/todos')
             ->assertOk()
             ->assertJsonStructure([['id', 'content', 'status', 'created_at', 'updated_at']]);
    }

    /**
     * filter=active must return only tasks with status=false (not yet done).
     * Completed tasks must be hidden from the active view.
     */
    public function test_get_todos_filter_active_returns_only_incomplete_todos(): void
    {
        Todo::factory()->create(['status' => false, 'content' => 'Active task']);
        Todo::factory()->create(['status' => true,  'content' => 'Done task']);

        $response = $this->getJson('/api/todos?filter=active');

        $response->assertOk()
                 ->assertJsonCount(1)
                 ->assertJsonPath('0.status', false);
    }

    /**
     * filter=completed must return only tasks with status=true.
     * Active tasks must not appear in the completed view.
     */
    public function test_get_todos_filter_completed_returns_only_done_todos(): void
    {
        Todo::factory()->create(['status' => false, 'content' => 'Active task']);
        Todo::factory()->create(['status' => true,  'content' => 'Done task']);

        $response = $this->getJson('/api/todos?filter=completed');

        $response->assertOk()
                 ->assertJsonCount(1)
                 ->assertJsonPath('0.status', true);
    }

    /**
     * filter=all is the explicit form of "no filter" — all todos regardless
     * of status. Equivalent to omitting the query param entirely.
     */
    public function test_get_todos_filter_all_returns_every_todo(): void
    {
        Todo::factory()->create(['status' => false]);
        Todo::factory()->create(['status' => true]);

        $this->getJson('/api/todos?filter=all')
             ->assertOk()
             ->assertJsonCount(2);
    }

    /**
     * Edge case: an unrecognised filter value should not crash the app or
     * silently return zero results — it should fall back to returning all todos.
     */
    public function test_get_todos_unknown_filter_value_returns_all_todos(): void
    {
        Todo::factory()->count(3)->create();

        $this->getJson('/api/todos?filter=bogus')
             ->assertOk()
             ->assertJsonCount(3);
    }

    // -------------------------------------------------------------------------
    // POST /api/todos
    // -------------------------------------------------------------------------

    /**
     * Happy path: client supplies both content and an explicit status.
     * The todo must be persisted and the created resource returned.
     */
    public function test_post_todos_creates_todo_with_explicit_status(): void
    {
        $payload = ['content' => 'Buy milk', 'status' => true];

        $response = $this->postJson('/api/todos', $payload);

        $response->assertCreated()
                 ->assertJsonPath('content', 'Buy milk')
                 ->assertJsonPath('status', true);

        $this->assertDatabaseHas('todos', $payload);
    }

    /**
     * When status is omitted the server must default it to false (active).
     * The client should never be forced to send a status on creation.
     */
    public function test_post_todos_status_defaults_to_false_when_omitted(): void
    {
        $response = $this->postJson('/api/todos', ['content' => 'Default status task']);

        $response->assertCreated()
                 ->assertJsonPath('status', false);

        $this->assertDatabaseHas('todos', ['content' => 'Default status task', 'status' => false]);
    }

    /**
     * content is the only meaningful data in a todo. Without it there is
     * nothing to store — must return 422 Unprocessable Entity.
     */
    public function test_post_todos_requires_content(): void
    {
        $this->postJson('/api/todos', [])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: content cannot be an empty string — a blank task is meaningless.
     */
    public function test_post_todos_content_cannot_be_empty_string(): void
    {
        $this->postJson('/api/todos', ['content' => ''])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: passing a non-string (e.g. integer) as content must be rejected.
     * The API contract specifies content is a string.
     */
    public function test_post_todos_content_must_be_a_string(): void
    {
        $this->postJson('/api/todos', ['content' => 12345])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: content exceeding 255 characters must be rejected to prevent
     * database column overflow and enforce a sensible task description limit.
     */
    public function test_post_todos_content_cannot_exceed_255_characters(): void
    {
        $this->postJson('/api/todos', ['content' => str_repeat('a', 256)])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: status must be boolean — passing a string like "yes" must
     * be rejected so the boolean column is never corrupted.
     */
    public function test_post_todos_status_must_be_boolean_when_provided(): void
    {
        $this->postJson('/api/todos', ['content' => 'Task', 'status' => 'yes'])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['status']);
    }

    /**
     * The created todo response must include all fields the client needs to
     * render the new item immediately without a follow-up GET.
     */
    public function test_post_todos_response_has_correct_structure(): void
    {
        $this->postJson('/api/todos', ['content' => 'Structure check'])
             ->assertCreated()
             ->assertJsonStructure(['id', 'content', 'status', 'created_at', 'updated_at']);
    }

    // -------------------------------------------------------------------------
    // PUT /api/todos/{id}
    // -------------------------------------------------------------------------

    /**
     * Happy path: update both content and status — response must reflect
     * the new values and the record must be persisted correctly.
     */
    public function test_put_todo_updates_both_fields(): void
    {
        $todo = Todo::factory()->create(['content' => 'Old content', 'status' => false]);

        $this->putJson("/api/todos/{$todo->id}", ['content' => 'New content', 'status' => true])
             ->assertOk()
             ->assertJsonPath('content', 'New content')
             ->assertJsonPath('status', true);

        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'content' => 'New content', 'status' => true]);
    }

    /**
     * Partial update: only content supplied — status must remain unchanged.
     * PUT here behaves as a partial update because forcing all fields
     * would break the simple toggle-status UX on the frontend.
     */
    public function test_put_todo_updates_only_content_when_status_omitted(): void
    {
        $todo = Todo::factory()->create(['content' => 'Old', 'status' => true]);

        $this->putJson("/api/todos/{$todo->id}", ['content' => 'Updated'])
             ->assertOk()
             ->assertJsonPath('content', 'Updated')
             ->assertJsonPath('status', true);
    }

    /**
     * Partial update: only status supplied — content must remain unchanged.
     * Typical use case is the checkbox toggle on the todo list.
     */
    public function test_put_todo_updates_only_status_when_content_omitted(): void
    {
        $todo = Todo::factory()->create(['content' => 'Keep this', 'status' => false]);

        $this->putJson("/api/todos/{$todo->id}", ['status' => true])
             ->assertOk()
             ->assertJsonPath('content', 'Keep this')
             ->assertJsonPath('status', true);
    }

    /**
     * Edge case: empty body with no fields at all is meaningless — the client
     * must supply at least one field to change, otherwise return 422.
     */
    public function test_put_todo_requires_at_least_one_field(): void
    {
        $todo = Todo::factory()->create();

        $this->putJson("/api/todos/{$todo->id}", [])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content', 'status']);
    }

    /**
     * Edge case: content cannot be updated to an empty string —
     * the todo would become meaningless.
     */
    public function test_put_todo_content_cannot_be_empty_string(): void
    {
        $todo = Todo::factory()->create();

        $this->putJson("/api/todos/{$todo->id}", ['content' => ''])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: content update exceeding 255 characters must be rejected
     * for the same reason as on creation — consistent column constraint enforcement.
     */
    public function test_put_todo_content_cannot_exceed_255_characters(): void
    {
        $todo = Todo::factory()->create();

        $this->putJson("/api/todos/{$todo->id}", ['content' => str_repeat('a', 256)])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['content']);
    }

    /**
     * Edge case: status must remain boolean — a string like "true" must
     * be rejected to prevent silent corruption of the boolean column.
     */
    public function test_put_todo_status_must_be_boolean(): void
    {
        $todo = Todo::factory()->create();

        $this->putJson("/api/todos/{$todo->id}", ['status' => 'yes'])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['status']);
    }

    /**
     * Trying to update a todo that does not exist must return 404.
     * The client should handle this by removing the item from the UI.
     */
    public function test_put_todo_returns_404_for_nonexistent_id(): void
    {
        $this->putJson('/api/todos/999', ['content' => 'Ghost'])
             ->assertNotFound();
    }

    /**
     * The update response must include all todo fields so the client
     * can replace the local record without a follow-up GET.
     */
    public function test_put_todo_response_has_correct_structure(): void
    {
        $todo = Todo::factory()->create();

        $this->putJson("/api/todos/{$todo->id}", ['content' => 'Structured'])
             ->assertOk()
             ->assertJsonStructure(['id', 'content', 'status', 'created_at', 'updated_at']);
    }

    // -------------------------------------------------------------------------
    // DELETE /api/todos/{id}
    // -------------------------------------------------------------------------

    /**
     * Happy path: deleting an existing todo returns 204 No Content
     * and removes the record from the database.
     */
    public function test_delete_todo_removes_todo_and_returns_204(): void
    {
        $todo = Todo::factory()->create();

        $this->deleteJson("/api/todos/{$todo->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }

    /**
     * Edge case: deleting a non-existent ID must return 404.
     * Attempting to delete something that is already gone should not
     * silently succeed — the client should know the resource was not found.
     */
    public function test_delete_todo_returns_404_for_nonexistent_id(): void
    {
        $this->deleteJson('/api/todos/999')
             ->assertNotFound();
    }

    /**
     * Edge case: deleting with a non-numeric route segment (e.g. "abc")
     * must return 404 — the route expects an integer ID only.
     */
    public function test_delete_todo_returns_404_for_non_numeric_id(): void
    {
        $this->deleteJson('/api/todos/abc')
             ->assertNotFound();
    }

    /**
     * Edge case: re-deleting an already-deleted todo must return 404.
     * Two consecutive DELETEs on the same ID should not both succeed —
     * idempotency at the HTTP level is fine, but the second call must
     * signal the resource is gone.
     */
    public function test_delete_todo_returns_404_when_already_deleted(): void
    {
        $todo = Todo::factory()->create();
        $todo->delete();

        $this->deleteJson("/api/todos/{$todo->id}")
             ->assertNotFound();
    }
}
