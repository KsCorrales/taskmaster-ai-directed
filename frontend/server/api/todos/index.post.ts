export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  return $fetch(`${config.apiBase}/todos`, {
    method: 'POST',
    body,
  })
})
