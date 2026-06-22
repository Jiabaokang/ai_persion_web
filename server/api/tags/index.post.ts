import { z } from 'h3-zod'
import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'
import { slugify } from '~/server/utils/markdown'

const Body = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  return useDB()
    .insert(tags)
    .values({ name: body.name, slug: slugify(body.name), color: body.color })
    .returning()
    .get()
})
