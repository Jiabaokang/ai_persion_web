import { fetchAihotItemDetail, isAihotId } from '../ai-nav.get'

export default defineCachedEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!isAihotId(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid AIHOT item id' })

  try {
    return await fetchAihotItemDetail(id)
  }
  catch (cause) {
    const notFound = cause instanceof Error && cause.message === 'AIHOT item not found'
    throw createError({
      statusCode: notFound ? 404 : 502,
      statusMessage: notFound ? 'AIHOT item not found' : 'AIHOT data is temporarily unavailable',
      cause,
    })
  }
}, {
  maxAge: 60,
  staleMaxAge: 300,
})
