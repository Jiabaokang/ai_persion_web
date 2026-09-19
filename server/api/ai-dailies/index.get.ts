import { fetchAihotDailies } from '../ai-nav.get'

export default defineCachedEventHandler(async () => {
  try {
    return await fetchAihotDailies()
  }
  catch (cause) {
    throw createError({
      statusCode: 502,
      statusMessage: 'AIHOT dailies are temporarily unavailable',
      cause,
    })
  }
}, {
  maxAge: 300,
  staleMaxAge: 1800,
})
