import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Загружаем переменные окружения из .env
dotenv.config()

// Настраиваем подключение к базе данных (Prisma 7)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Тестовый маршрут
app.get('/api/health', async (req, res) => {
  try {
    // Проверяем связь с БД (считаем количество команд)
    const teamCount = await prisma.team.count()
    res.json({ status: 'OK', message: 'API СКА-Нева работает!', teamsInDb: teamCount })
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Ошибка подключения к БД' })
  }
})
// Эндпоинт: Получить всех игроков
app.get('/api/players', async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        stats: true // Подтягиваем статистику игрока
      },
      orderBy: {
        number: 'asc' // Сортируем по номеру
      }
    })
    res.json(players)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка при получении игроков' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
})