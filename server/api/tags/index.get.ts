import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'

export default defineEventHandler(() => useDB().select().from(tags).all())
