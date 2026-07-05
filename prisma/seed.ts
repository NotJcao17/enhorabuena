import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'password'
  const name = process.env.ADMIN_NAME || 'Administrador'

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash, name },
    create: { username, passwordHash, name }
  })
  console.log('Admin user created:', admin.username)

  const configs = [
    { key: 'whatsapp_maru', value: '524774499628' },
    { key: 'whatsapp_mosco', value: '524777240506' },
    { key: 'store_name', value: 'Enhorabuena' }
  ]

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { key: config.key, value: config.value }
    })
    console.log('Config set:', config.key)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
