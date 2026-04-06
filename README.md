## Objective

The objective of this challenge is to build a full-stack todo application utilizing Laravel as the back-end API and Nuxt for the front-end.

## Brief

In this exercise, you will create a simple, yet functional, Todo application. Users will be able to add, update, and delete tasks. They will also have the ability to filter tasks based on their completion status. The design will be up to your discretion.

**Server Side**

1. Set up a new Laravel project.
2. Implement the following API endpoints:
    - `GET /todos` - Fetch all todos.
    - `POST /todos` - Create a new todo. This should accept a JSON body with the `content` of the task and its `status`.
    - `PUT /todos/{id}` - Update a todo. This should accept a JSON body with the new `content` and/or `status`.
    - `DELETE /todos/{id}` - Delete a todo.
3. Each todo item should have the following fields:
    - `id` (integer)
    - `content` (string)
    - `status` (boolean)
4. Implement a SQLite database using Laravel's database migrations and Eloquent ORM to store the todos.
5. Write tests to ensure the API endpoints are working as expected.

**Client Side**

1. Set up a new Nuxt project.
2. Create the following pages:
    - Home page (`/`) - Display all todos, with the ability to filter by their status (all, active, completed).
3. On the home page, implement the following functionality:
    - Add a new task.
    - Mark a task as completed.
    - Delete a task.
    - Filter tasks based on their status.
4. Use Vuex for state management.
5. Write tests to ensure the UI behaves as expected.

### Evaluation Criteria

- We're looking for you to produce working code, with enough room to demonstrate how to structure components in a small program
- Completeness: did you complete the features?
- Correctness: does the functionality act in sensible, thought-out ways?
- Maintainability: is it written in a clean, maintainable way?
- Testing: is the system adequately tested?

### CodeSubmit 

Please organize, design, test, and document your code as if it were
going into production - then push your changes to the master branch.

Good luck and happy coding!

The SolidProfessor Team