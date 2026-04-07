export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const params = new URLSearchParams()
  if (query.filter && query.filter !== 'all') {
    params.set('filter', String(query.filter))
  }

  const url = params.size
    ? `${config.apiBase}/todos?${params.toString()}`
    : `${config.apiBase}/todos`

  return $fetch(url)
})
