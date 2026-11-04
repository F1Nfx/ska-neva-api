import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Для миграций Prisma CLI использует прямой URL (порт 5432)
    url: env('DIRECT_URL'), 
  },
})