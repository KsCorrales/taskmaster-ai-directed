export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  return $fetch(`${config.apiBase}/todos/${id}`, {
    method: 'DELETE',
  })
})
