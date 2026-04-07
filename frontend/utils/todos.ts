export interface Todo {
  id: number
  content: string
  status: boolean
  created_at: string
  updated_at: string
}

export const getTodos = (filter?: string): Promise<Todo[]> => {
  return $fetch<Todo[]>('/api/todos', {
    method: 'GET',
    ...(filter ? { params: { filter } } : {}),
  })
}

export const createTodo = (content: string): Promise<Todo> => {
  return $fetch<Todo>('/api/todos', {
    method: 'POST',
    body: { content },
  })
}

export const updateTodo = (id: number, data: Partial<Pick<Todo, 'content' | 'status'>>): Promise<Todo> => {
  return $fetch<Todo>(`/api/todos/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export const deleteTodo = (id: number): Promise<void> => {
  return $fetch<void>(`/api/todos/${id}`, {
    method: 'DELETE',
  })
}
