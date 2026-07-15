import { ensureAdminUser } from '~/server/utils/init-admin'
import { isSafeProductionBootstrap } from '~/server/utils/security'

export default defineNitroPlugin(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  if (process.env.NODE_ENV === 'production' && !isSafeProductionBootstrap(username, password)) {
    console.error('[INIT] Production requires ADMIN_USERNAME and an ADMIN_PASSWORD of at least 16 characters that is not the default password')
    process.exit(1)
  }
  await ensureAdminUser(username, password)
  if (password === 'admin123') {
    console.warn('[INIT] Using default admin password, please change it in production!')
  }
})
