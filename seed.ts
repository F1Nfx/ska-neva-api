import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Начинаем заполнение базы...')

  // 1. Создаем команды (нашу и соперников)
  const ourTeam = await prisma.team.create({
    data: {
      name: 'СКА-Нева',
      city: 'Санкт-Петербург',
      shortName: 'СКА',
      color: 'from-ska-red to-ska-blue',
      isOurTeam: true,
    }
  })

  const volga = await prisma.team.create({
    data: {
      name: 'Волга-Тверь',
      city: 'Тверь',
      shortName: 'ВТ',
      color: 'from-slate-500 to-slate-700',
    }
  })

  // 2. Создаем тренеров
  await prisma.staff.createMany({
    data: [
      { teamId: ourTeam.id, name: 'Диментий Диментьев', role: 'Главный тренер', age: 52, initials: 'ДД' },
      { teamId: ourTeam.id, name: 'Рига Дмитрович', role: 'Старший тренер', age: 47, initials: 'РД' },
    ]
  })

  // 3. Создаем игроков (пример пары)
  const belov = await prisma.player.create({
    data: {
      teamId: ourTeam.id,
      number: 1,
      name: 'Артём Белов',
      position: 'Вратарь',
      age: 28,
      height: 190,
      weight: 84,
      foot: 'Правый',
      birthplace: 'Санкт-Петербург',
      joinedAt: '2021',
      bio: 'Воспитанник петербургской школы футбола...',
    }
  })

  // Создаем статистику для Белова
  await prisma.playerStat.create({
    data: {
      playerId: belov.id,
      season: '2025/26',
      matches: 11,
      goals: 0,
      assists: 0,
      yellowCards: 1,
      redCards: 0,
    }
  })

  // 4. Создаем новость
  await prisma.news.create({
    data: {
      tag: 'Матч',
      title: 'СКА-Нева обыграла «Волгу-Тверь» со счётом 2:1',
      excerpt: 'Голами отметились Иванов и Петров.',
      dateStr: '11 октября 2026',
      author: 'Пресс-служба клуба',
      gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy',
      icon: '⚽',
      content: [
        'На «Нева-Арене» завершился матч 10-го тура...',
        'Победный гол забил Иван Петров на 78-й минуте...',
      ]
    }
  })

  // 5. Создаем матч
  await prisma.match.create({
    data: {
      tour: 10,
      tournament: 'ФНЛ-3',
      dateStr: '11 октября 2026',
      time: '18:00',
      stadium: '«Нева-Арена», Санкт-Петербург',
      homeTeamId: ourTeam.id,
      awayTeamId: volga.id,
      homeScore: 2,
      awayScore: 1,
      status: 'finished',
    }
  })

  console.log('✅ База успешно заполнена!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })