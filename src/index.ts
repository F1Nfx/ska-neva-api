import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Загружаем переменные окружения из .env
dotenv.config()

// Настраиваем подключение к базе данных (Prisma 7)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// --- АВТОРИЗАЦИЯ ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await prisma.admin.findUnique({ where: { username } })
    if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль' })

    const validPassword = await bcrypt.compare(password, admin.password)
    if (!validPassword) return res.status(401).json({ error: 'Неверный логин или пароль' })

    const token = jwt.sign({ id: admin.id, username: admin.username }, 'SUPER_SECRET_KEY', { expiresIn: '24h' })
    res.json({ token, message: 'Успешный вход' })
  } catch (error) {
    console.error('ОШИБКА ПРИ ВХОДЕ:', error)
    res.status(500).json({ error: 'Ошибка сервера при входе' })
  }
})

// --- ПОЛУЧЕНИЕ ДАННЫХ (GET) ---
app.get('/api/health', async (req, res) => {
  try {
    const teamCount = await prisma.team.count()
    res.json({ status: 'OK', message: 'API СКА-Нева работает!', teamsInDb: teamCount })
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Ошибка подключения к БД' })
  }
})

app.get('/api/players', async (req, res) => {
  try {
    const players = await prisma.player.findMany({ include: { stats: true }, orderBy: { number: 'asc' } })
    res.json(players)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении игроков' }) }
})

app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: Number(req.params.id) },
      include: { stats: true, team: true }
    })
    if (!player) return res.status(404).json({ error: 'Игрок не найден' })
    res.json(player)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении игрока' }) }
})

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({ include: { homeTeam: true, awayTeam: true }, orderBy: { id: 'desc' } })
    res.json(matches)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении матчей' }) }
})

app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: Number(req.params.id) },
      include: { homeTeam: true, awayTeam: true, events: true, stats: true }
    })
    if (!match) return res.status(404).json({ error: 'Матч не найден' })
    res.json(match)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении матча' }) }
})

app.get('/api/standings', async (req, res) => {
  try {
    const standings = await prisma.standing.findMany({ include: { team: true }, orderBy: { position: 'asc' } })
    res.json(standings)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении таблицы' }) }
})

app.get('/api/news', async (req, res) => {
  try {
    const news = await prisma.news.findMany({ orderBy: { id: 'desc' } })
    res.json(news)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении новостей' }) }
})

app.get('/api/news/:id', async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({ where: { id: Number(req.params.id) } })
    if (!newsItem) return res.status(404).json({ error: 'Новость не найдена' })
    res.json(newsItem)
  } catch (error) { res.status(500).json({ error: 'Ошибка при получении новости' }) }
})

// --- СОЗДАНИЕ ДАННЫХ (POST) ---
app.post('/api/news', async (req, res) => {
  try {
    const { tag, title, excerpt, author, icon, gradient, content } = req.body
    const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')

    const newNews = await prisma.news.create({
      data: { tag, title, excerpt, dateStr, author, gradient, icon, content }
    })
    res.status(201).json(newNews)
  } catch (error) {
    console.error('Ошибка при создании новости:', error)
    res.status(500).json({ error: 'Не удалось создать новость' })
  }
})

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({ 
      include: { homeTeam: true, awayTeam: true, events: true }, // <--- ДОБАВИЛИ EVENTS
      orderBy: { id: 'desc' } 
    })
    res.json(matches)
  } catch (error) { res.status(500).json({ error: 'Ошибка' }) }
})

// Эндпоинт: Обновить счет матча
app.put('/api/matches/:id', async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body
    
    const updatedMatch = await prisma.match.update({
      where: { id: Number(req.params.id) },
      data: {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        status: 'finished' // Как только ввели счет, матч считается завершенным
      }
    })
    res.json(updatedMatch)
  } catch (error) {
    console.error('Ошибка при обновлении матча:', error)
    res.status(500).json({ error: 'Не удалось обновить матч' })
  }
})
// Эндпоинт: Добавить событие в матч
app.post('/api/matches/:id/events', async (req, res) => {
  try {
    const { minute, type, teamId, playerName } = req.body
    
    const newEvent = await prisma.matchEvent.create({
      data: {
        matchId: Number(req.params.id),
        minute: Number(minute),
        type,
        teamId: Number(teamId),
        playerName
      }
    })
    res.status(201).json(newEvent)
  } catch (error) {
    console.error('Ошибка при добавлении события:', error)
    res.status(500).json({ error: 'Не удалось добавить событие' })
  }
})
// Эндпоинт: Создать нового игрока
app.post('/api/players', async (req, res) => {
  try {
    const { name, number, position, age, height, weight, foot, birthplace, joinedAt, bio } = req.body
    
    // Ищем нашу команду в базе по флагу isOurTeam
    const ourTeam = await prisma.team.findFirst({ where: { isOurTeam: true } })
    if (!ourTeam) return res.status(500).json({ error: 'Команда не найдена' })

    const newPlayer = await prisma.player.create({
      data: {
        name,
        number: Number(number),
        position,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        foot,
        birthplace,
        joinedAt,
        bio: bio || 'Информация пока не добавлена.',
        teamId: ourTeam.id,
        stats: {
          create: {
            season: '2025/26',
            matches: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0
          }
        }
      }
    })
    res.status(201).json(newPlayer)
  } catch (error) {
    console.error('Ошибка при создании игрока:', error)
    res.status(500).json({ error: 'Не удалось создать игрока' })
  }
})

// Эндпоинт: Удалить игрока
app.delete('/api/players/:id', async (req, res) => {
  try {
    await prisma.player.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Игрок удален' })
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить игрока' })
  }
})


// Эндпоинт: Обновить данные турнирной таблицы
app.put('/api/standings/:id', async (req, res) => {
  try {
    const { played, wins, draws, losses, goalsFor, goalsAgainst, points } = req.body
    const id = Number(req.params.id)

    // 1. Сохраняем новые данные команды
    await prisma.standing.update({
      where: { id },
      data: {
        played: Number(played),
        wins: Number(wins),
        draws: Number(draws),
        losses: Number(losses),
        goalsFor: Number(goalsFor),
        goalsAgainst: Number(goalsAgainst),
        points: Number(points)
      }
    })

    // 2. Получаем ВСЕ команды
    const allStandings = await prisma.standing.findMany()

    // 3. Сортируем их по футбольным правилам
    allStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points // Сначала по очкам
      const diffA = a.goalsFor - a.goalsAgainst
      const diffB = b.goalsFor - b.goalsAgainst
      if (diffB !== diffA) return diffB - diffA // Потом по разнице мячей
      return b.goalsFor - a.goalsFor // Затем по забитым
    })

    // 4. Обновляем поле position (место) для всех команд в базе
    const updates = allStandings.map((s, index) => 
      prisma.standing.update({
        where: { id: s.id },
        data: { position: index + 1 }
      })
    )
    await prisma.$transaction(updates)

    res.json({ message: 'Таблица обновлена и пересортирована' })
  } catch (error) {
    console.error('Ошибка при обновлении таблицы:', error)
    res.status(500).json({ error: 'Не удалось обновить таблицу' })
  }
})

// Эндпоинт: Сделать матч главным на анонсе
app.put('/api/matches/:id/feature', async (req, res) => {
  try {
    const matchId = Number(req.params.id)

    // 1. Убираем статус "главного" у всех матчей
    await prisma.match.updateMany({
      data: { isFeatured: false }
    })

    // 2. Делаем главным выбранный матч
    await prisma.match.update({
      where: { id: matchId },
      data: { isFeatured: true }
    })

    res.json({ message: 'Матч назначен главным' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при выборе главного матча' })
  }
})

// Эндпоинт: Удалить новость
app.delete('/api/news/:id', async (req, res) => {
  try {
    await prisma.news.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Новость успешно удалена' })
  } catch (error) {
    console.error('Ошибка при удалении новости:', error)
    res.status(500).json({ error: 'Не удалось удалить новость' })
  }
})

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
})