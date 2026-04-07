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
}
