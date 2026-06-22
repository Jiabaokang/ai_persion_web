import { ensureAdminUser } from '~/server/utils/init-admin'

export default defineNitroPlugin(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  await ensureAdminUser(username, password)
  if (password === 'admin123') {
    console.warn('[INIT] Using default admin password, please change it in production!')
  }
})
