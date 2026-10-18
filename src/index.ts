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

// Эндпоинт: Получить все матчи
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { id: 'desc' } // Сначала новые
    })
    res.json(matches)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении матчей' })
  }
})

// Эндпоинт: Получить все новости
app.get('/api/news', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { id: 'desc' }
    })
    res.json(news)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении новостей' })
  }
})

// Эндпоинт: Получить турнирную таблицу
app.get('/api/standings', async (req, res) => {
  try {
    const standings = await prisma.standing.findMany({
      include: { team: true },
      orderBy: { position: 'asc' }
    })
    res.json(standings)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении таблицы' })
  }
})

// Эндпоинт: Получить конкретного игрока по ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        stats: true, // Подтягиваем статистику
        team: true   // Подтягиваем информацию о команде
      }
    })
    if (!player) return res.status(404).json({ error: 'Игрок не найден' })
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении игрока' })
  }
})

// Эндпоинт: Получить конкретный матч по ID
app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: true, // Хронология
        stats: true   // Статистика
      }
    })
    if (!match) return res.status(404).json({ error: 'Матч не найден' })
    res.json(match)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении матча' })
  }
})

// Эндпоинт: Получить одну новость по ID
app.get('/api/news/:id', async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!newsItem) return res.status(404).json({ error: 'Новость не найдена' })
    res.json(newsItem)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении новости' })
  }
})

app.listen(PORT, () => {
  console.log(` Сервер запущен на порту ${PORT}`)
})