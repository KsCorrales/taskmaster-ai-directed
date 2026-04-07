import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock $fetch globally — utils use it internally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import { getTodos, createTodo, updateTodo, deleteTodo } from '~/utils/todos'

const makeTodo = (overrides = {}) => ({
  id: 1,
  content: 'Test',
  status: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

beforeEach(() => { vi.clearAllMocks() })

// ---------------------------------------------------------------------------
// getTodos
// ---------------------------------------------------------------------------

describe('getTodos', () => {
  /**
   * Happy path: returns the array the proxy responds with.
   */
  it('calls GET /api/todos and returns the list', async () => {
    const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })]
    mockFetch.mockResolvedValue(todos)

    const result = await getTodos()

    expect(mockFetch).toHaveBeenCalledWith('/api/todos', expect.objectContaining({ method: 'GET' }))
    expect(result).toEqual(todos)
  })

  /**
   * Filter param must be forwarded as a query string so the backend
   * can apply the correct SQL filter.
   */
  it('forwards the filter query param when provided', async () => {
    mockFetch.mockResolvedValue([])

    await getTodos('active')

    expect(mockFetch).toHaveBeenCalledWith('/api/todos', expect.objectContaining({
      params: { filter: 'active' },
    }))
  })

  /**
   * Edge case: no filter arg → no params key in the request.
   */
  it('omits params when no filter is provided', async () => {
    mockFetch.mockResolvedValue([])

    await getTodos()

    const call = mockFetch.mock.calls[0][1]
    expect(call.params).toBeUndefined()
  })

  /**
   * Edge case: network error must propagate so the store can catch it.
   */
  it('propagates errors to the caller', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(getTodos()).rejects.toThrow('Network error')
  })
})

// ---------------------------------------------------------------------------
// createTodo
// ---------------------------------------------------------------------------

describe('createTodo', () => {
  it('calls POST /api/todos with content and returns the created todo', async () => {
    const created = makeTodo({ id: 5, content: 'Buy milk' })
    mockFetch.mockResolvedValue(created)

    const result = await createTodo('Buy milk')

    expect(mockFetch).toHaveBeenCalledWith('/api/todos', expect.objectContaining({
      method: 'POST',
      body: { content: 'Buy milk' },
    }))
    expect(result).toEqual(created)
  })

  /**
   * Edge case: empty string should still be sent — validation
   * is the backend's responsibility; utils should not silently strip input.
   */
  it('sends the content as-is without trimming', async () => {
    mockFetch.mockResolvedValue(makeTodo())

    await createTodo('  spaced  ')

    const body = mockFetch.mock.calls[0][1].body
    expect(body.content).toBe('  spaced  ')
  })
})

// ---------------------------------------------------------------------------
// updateTodo
// ---------------------------------------------------------------------------

describe('updateTodo', () => {
  it('calls PUT /api/todos/{id} with the provided data', async () => {
    const updated = makeTodo({ id: 3, status: true })
    mockFetch.mockResolvedValue(updated)

    const result = await updateTodo(3, { status: true })

    expect(mockFetch).toHaveBeenCalledWith('/api/todos/3', expect.objectContaining({
      method: 'PUT',
      body: { status: true },
    }))
    expect(result).toEqual(updated)
  })

  /**
   * Edge case: both fields can be updated together.
   */
  it('can update both content and status in one call', async () => {
    mockFetch.mockResolvedValue(makeTodo({ content: 'New', status: true }))

    await updateTodo(1, { content: 'New', status: true })

    const body = mockFetch.mock.calls[0][1].body
    expect(body).toEqual({ content: 'New', status: true })
  })
})

// ---------------------------------------------------------------------------
// deleteTodo
// ---------------------------------------------------------------------------

describe('deleteTodo', () => {
  it('calls DELETE /api/todos/{id}', async () => {
    mockFetch.mockResolvedValue(undefined)

    await deleteTodo(7)

    expect(mockFetch).toHaveBeenCalledWith('/api/todos/7', expect.objectContaining({
      method: 'DELETE',
    }))
  })

  /**
   * Edge case: network failure on delete must propagate.
   */
  it('propagates errors to the caller', async () => {
    mockFetch.mockRejectedValue(new Error('Not found'))

    await expect(deleteTodo(999)).rejects.toThrow('Not found')
  })
})
