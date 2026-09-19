import { fetchAihotDaily, isAihotDate } from '../ai-nav.get'

export default defineCachedEventHandler(async (event) => {
  const date = getRouterParam(event, 'date') ?? ''
  if (!isAihotDate(date)) throw createError({ statusCode: 400, statusMessage: 'Invalid AIHOT daily date' })

  try {
    return await fetchAihotDaily(date)
  }
  catch (cause) {
    throw createError({
      statusCode: 502,
      statusMessage: 'AIHOT daily is temporarily unavailable',
      cause,
    })
  }
}, {
  maxAge: 300,
  staleMaxAge: 1800,
})
