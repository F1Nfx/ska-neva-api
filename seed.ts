import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Очищаем старые данные...')
  await prisma.matchStats.deleteMany()
  await prisma.matchEvent.deleteMany()
  await prisma.playerStat.deleteMany()
  await prisma.match.deleteMany()
  await prisma.player.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.standing.deleteMany()
  await prisma.news.deleteMany()
  await prisma.team.deleteMany()

  // Сбрасываем счетчики ID
  await prisma.$executeRaw`TRUNCATE TABLE "Player", "Team", "Staff", "Match", "MatchEvent", "MatchStats", "News", "Standing", "PlayerStat" RESTART IDENTITY CASCADE;`

  console.log('Загружаем команды...')
  // Используем key для уникальности, чтобы не было конфликтов с двумя "Волгами"
  const teamsData = [
    { key: 'volga-tver', name: 'Волга', city: 'Тверь', shortName: 'ВТ', color: 'from-slate-500 to-slate-700', isOurTeam: false, logoUrl: '/logo/logo-volga-tver.png' },
    { key: 'ska-neva', name: 'СКА-Нева', city: 'Санкт-Петербург', shortName: 'СКА', color: 'from-ska-red to-ska-blue', isOurTeam: true, logoUrl: '/logo-icon.png' },
    { key: 'volga-kostroma', name: 'Волга', city: 'Кострома', shortName: 'ВК', color: 'from-blue-800 to-blue-950', isOurTeam: false, logoUrl: '/logo/logo-volga-kostroma.png' },
    { key: 'zarya', name: 'Заря', city: 'Балтийск', shortName: 'ЗБ', color: 'from-sky-700 to-blue-900', isOurTeam: false, logoUrl: '/logo/logo-zarya-baltiysk.png' },
    { key: 'shtorm', name: 'Шторм', city: 'Санкт-Петербург', shortName: 'ШТ', color: 'from-sky-500 to-blue-700', isOurTeam: false, logoUrl: '/logo/logo-shtorm.png' },
    { key: 'lev', name: 'Лев', city: 'Владимир', shortName: 'ЛВ', color: 'from-slate-600 to-slate-800', isOurTeam: false, logoUrl: '/logo/logo-lev-vladimir.png' },
    { key: 'molot', name: 'Молот', city: 'Нижний Тагил', shortName: 'МН', color: 'from-red-700 to-red-900', isOurTeam: false, logoUrl: '/logo/logo-molot.png' },
    { key: 'zamok', name: 'Замок', city: 'Выборг', shortName: 'ЗВ', color: 'from-indigo-700 to-indigo-900', isOurTeam: false, logoUrl: '/logo/logo-zamok.png' },
    { key: 'kursk', name: 'Курск', city: 'Курск', shortName: 'КР', color: 'from-blue-600 to-blue-800', isOurTeam: false, logoUrl: '/logo/logo-kursk.png' },
    { key: 'krasnoyarsk', name: 'Красноярск', city: 'Красноярск', shortName: 'КЯ', color: 'from-orange-600 to-orange-800', isOurTeam: false, logoUrl: '/logo/logo-krasnoyarsk.png' },
    { key: 'mayak', name: 'Маяк', city: 'Ульяновск', shortName: 'МУ', color: 'from-emerald-700 to-emerald-900', isOurTeam: false, logoUrl: '/logo/logo-mayak.png' },
    { key: 'bars', name: 'Барс', city: 'Владикавказ', shortName: 'БА', color: 'from-yellow-600 to-yellow-800', isOurTeam: false, logoUrl: '/logo/logo-bars-alania.png' },
    { key: 'luch', name: 'Луч', city: 'Новосибирск', shortName: 'ЛН', color: 'from-cyan-700 to-cyan-900', isOurTeam: false, logoUrl: '/logo/logo-luch.png' },
    { key: 'amur', name: 'Амур', city: 'Комсомольск', shortName: 'АМ', color: 'from-teal-700 to-teal-900', isOurTeam: false, logoUrl: '/logo/logo-amur.png' },
    { key: 'sakhalin', name: 'Сахалин', city: 'Южно-Сахалинск', shortName: 'СХ', color: 'from-green-700 to-green-900', isOurTeam: false, logoUrl: '/logo/logo-sakhalin.png' },
    { key: 'elista', name: 'Элиста', city: 'Элиста', shortName: 'ЭЛ', color: 'from-purple-700 to-purple-950', isOurTeam: false, logoUrl: '/logo/logo-elista.png' },
  ]

  const teams: Record<string, any> = {}
  for (const t of teamsData) {
    teams[t.key] = await prisma.team.create({ 
      data: { 
        name: t.name, 
        city: t.city, 
        shortName: t.shortName, 
        color: t.color, 
        isOurTeam: t.isOurTeam,
        logoUrl: t.logoUrl // <--- ВОТ ЭТА СТРОЧКА
      } 
    })
  }
  const ourTeam = teams['ska-neva']

  console.log('Загружаем таблицу...')
  const standingsData = [
    { position: 1, teamKey: 'volga-tver', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 2, teamKey: 'ska-neva', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 3, teamKey: 'volga-kostroma', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 4, teamKey: 'zarya', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 5, teamKey: 'shtorm', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 6, teamKey: 'lev', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 7, teamKey: 'molot', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 8, teamKey: 'zamok', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 9, teamKey: 'kursk', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 10, teamKey: 'krasnoyarsk', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 11, teamKey: 'mayak', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 12, teamKey: 'bars', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 13, teamKey: 'luch', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 14, teamKey: 'amur', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 15, teamKey: 'sakhalin', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { position: 16, teamKey: 'elista', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ]
  for (const s of standingsData) {
    await prisma.standing.create({
      data: {
        teamId: teams[s.teamKey].id, season: '2026/27', position: s.position,
        played: s.played, wins: s.wins, draws: s.draws, losses: s.losses,
        goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst, points: s.points
      }
    })
  }

  console.log('Загружаем тренеров...')
  await prisma.staff.createMany({
    data: [
      { teamId: ourTeam.id, name: 'Диментий Диментьев', role: 'Главный тренер', age: 52, initials: 'ДД' },
      { teamId: ourTeam.id, name: 'Рига Дмитрович', role: 'Старший тренер', age: 47, initials: 'РД' },
      { teamId: ourTeam.id, name: 'Олег Щербаков', role: 'Тренер вратарей', age: 43, initials: 'ОЩ' },
      { teamId: ourTeam.id, name: 'Павел Дементьев', role: 'Тренер по физподготовке', age: 38, initials: 'ПД' },
    ]
  })

  console.log('Загружаем игроков...')
  const playersData = [
    { number: 1, name: 'Артём Белов', position: 'Вратарь', age: 28, height: 190, weight: 84, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2021', isCaptain: false, bio: 'Воспитанник петербургской школы футбола.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 27, name: 'Константин Финов', position: 'Вратарь', age: 22, height: 187, weight: 80, foot: 'Правый', birthplace: 'Таганрог', joinedAt: '2023', isCaptain: false, bio: 'Молодой голкипер.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 35, name: 'Максим Ветров', position: 'Вратарь', age: 19, height: 185, weight: 76, foot: 'Правый', birthplace: 'Колпино', joinedAt: '2025', isCaptain: false, bio: 'Воспитанник академии.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 4, name: 'Матвей Лукальдини', position: 'Защитник', age: 20, height: 188, weight: 80, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2024', isCaptain: true, bio: 'Самый молодой капитан.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 18, name: 'Даниил Творогов', position: 'Защитник', age: 26, height: 182, weight: 77, foot: 'Правый', birthplace: 'Омск', joinedAt: '2022', isCaptain: false, bio: 'Правый защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 3, name: 'Игорь Невский', position: 'Защитник', age: 24, height: 185, weight: 79, foot: 'Левый', birthplace: 'Выборг', joinedAt: '2023', isCaptain: false, bio: 'Левый защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 5, name: 'Роман Волков', position: 'Защитник', age: 27, height: 186, weight: 82, foot: 'Правый', birthplace: 'Калининград', joinedAt: '2021', isCaptain: false, bio: 'Опытный центральный защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 6, name: 'Сергей Березуцкий', position: 'Защитник', age: 23, height: 180, weight: 75, foot: 'Правый', birthplace: 'Тверь', joinedAt: '2024', isCaptain: false, bio: 'Универсальный защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 13, name: 'Кирилл Зайцев', position: 'Защитник', age: 25, height: 184, weight: 78, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2022', isCaptain: false, bio: 'Быстрый защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 22, name: 'Владислав Орлов', position: 'Защитник', age: 21, height: 179, weight: 73, foot: 'Левый', birthplace: 'Колпино', joinedAt: '2025', isCaptain: false, bio: 'Молодой воспитанник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 44, name: 'Степан Давиташвили', position: 'Защитник', age: 20, height: 183, weight: 77, foot: 'Правый', birthplace: 'Сочи', joinedAt: '2025', isCaptain: false, bio: 'Перспективный защитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 8, name: 'Никита Иванов', position: 'Полузащитник', age: 25, height: 178, weight: 72, foot: 'Правый', birthplace: 'Тверь', joinedAt: '2022', isCaptain: false, bio: 'Центральный полузащитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 10, name: 'Максим Кузнецов', position: 'Полузащитник', age: 28, height: 176, weight: 70, foot: 'Левый', birthplace: 'Москва', joinedAt: '2023', isCaptain: false, bio: 'Плеймейкер команды.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 7, name: 'Антон Смирнов', position: 'Полузащитник', age: 23, height: 180, weight: 74, foot: 'Правый', birthplace: 'Вологда', joinedAt: '2023', isCaptain: false, bio: 'Атакующий полузащитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 14, name: 'Дмитрий Бут', position: 'Полузащитник', age: 26, height: 175, weight: 71, foot: 'Правый', birthplace: 'Псков', joinedAt: '2022', isCaptain: false, bio: 'Опорный полузащитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 17, name: 'Александр Соловьёв', position: 'Полузащитник', age: 22, height: 177, weight: 72, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2024', isCaptain: false, bio: 'Молодой полузащитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 20, name: 'Павел Фомин', position: 'Полузащитник', age: 24, height: 179, weight: 73, foot: 'Левый', birthplace: 'Выборг', joinedAt: '2024', isCaptain: false, bio: 'Левый полузащитник.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 9, name: 'Алексей Соколов', position: 'Нападающий', age: 27, height: 185, weight: 80, foot: 'Правый', birthplace: 'Калининград', joinedAt: '2025', isCaptain: false, bio: 'Новичок сезона.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 11, name: 'Иван Петров', position: 'Нападающий', age: 24, height: 182, weight: 78, foot: 'Правый', birthplace: 'Выборг', joinedAt: '2020', isCaptain: false, bio: 'Воспитанник академии.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 19, name: 'Сергей Лебедев', position: 'Нападающий', age: 29, height: 187, weight: 83, foot: 'Правый', birthplace: 'Петрозаводск', joinedAt: '2023', isCaptain: false, bio: 'Опытный форвард.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 69, name: 'Василий Баронов', position: 'Нападающий', age: 21, height: 181, weight: 76, foot: 'Левый', birthplace: 'Красноярск', joinedAt: '2024', isCaptain: false, bio: 'Скоростной нападающий.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
    { number: 99, name: 'Дмитрий Снегов', position: 'Нападающий', age: 20, height: 184, weight: 78, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2025', isCaptain: false, bio: 'Самый молодой нападающий.', stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } },
  ]

  for (const p of playersData) {
    const { stats, ...playerData } = p
    const player = await prisma.player.create({ data: { ...playerData, teamId: ourTeam.id } })
    await prisma.playerStat.create({
      data: { playerId: player.id, season: '2026/27', ...stats }
    })
  }

  console.log('Загружаем матчи...')
  const matchesData = [
    // ПЕРВЫЙ КРУГ (15 туров)
    { tour: 1, dateStr: '14 февраля 2027', time: '17:00', stadium: 'Стадион «Енисей»', isHome: false, opp: 'krasnoyarsk', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 2, dateStr: '21 февраля 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'zamok', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 3, dateStr: '28 февраля 2027', time: '17:00', stadium: 'Стадион «Волга»', isHome: false, opp: 'volga-tver', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 4, dateStr: '7 марта 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'volga-kostroma', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 5, dateStr: '14 марта 2027', time: '19:00', stadium: 'Стадион «Балтика»', isHome: false, opp: 'zarya', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 6, dateStr: '21 марта 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'shtorm', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 7, dateStr: '28 марта 2027', time: '16:00', stadium: 'Стадион «Торпедо»', isHome: false, opp: 'lev', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 8, dateStr: '4 апреля 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'molot', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 9, dateStr: '11 апреля 2027', time: '17:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'kursk', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 10, dateStr: '18 апреля 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'mayak', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 11, dateStr: '25 апреля 2027', time: '16:00', stadium: 'Стадион «Спартак»', isHome: false, opp: 'bars', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 12, dateStr: '2 мая 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'luch', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 13, dateStr: '9 мая 2027', time: '18:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'amur', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 14, dateStr: '16 мая 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'sakhalin', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 15, dateStr: '23 мая 2027', time: '16:00', stadium: 'Стадион «Уралан»', isHome: false, opp: 'elista', scoreUs: null, scoreThem: null, status: 'upcoming' },

    // ВТОРОЙ КРУГ (15 туров - те же соперники, но меняются местами)
    { tour: 16, dateStr: '30 мая 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'krasnoyarsk', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 17, dateStr: '6 июня 2027', time: '17:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'zamok', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 18, dateStr: '13 июня 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'volga-tver', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 19, dateStr: '20 июня 2027', time: '17:00', stadium: 'Стадион «Волга»', isHome: false, opp: 'volga-kostroma', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 20, dateStr: '27 июня 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'zarya', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 21, dateStr: '4 июля 2027', time: '19:00', stadium: 'Стадион «Балтика»', isHome: false, opp: 'shtorm', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 22, dateStr: '11 июля 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'lev', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 23, dateStr: '18 июля 2027', time: '16:00', stadium: 'Стадион «Торпедо»', isHome: false, opp: 'molot', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 24, dateStr: '25 июля 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'kursk', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 25, dateStr: '1 августа 2027', time: '17:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'mayak', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 26, dateStr: '8 августа 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'bars', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 27, dateStr: '15 августа 2027', time: '16:00', stadium: 'Стадион «Спартак»', isHome: false, opp: 'luch', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 28, dateStr: '22 августа 2027', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'amur', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 29, dateStr: '29 августа 2027', time: '18:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'sakhalin', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 30, dateStr: '5 сентября 2027', time: '16:00', stadium: '«Нева-Арена»', isHome: true, opp: 'elista', scoreUs: null, scoreThem: null, status: 'upcoming' },
  ]

  for (const m of matchesData) {
    await prisma.match.create({
      data: {
        tour: m.tour, tournament: 'ФНЛ-3', dateStr: m.dateStr, time: m.time, stadium: m.stadium,
        homeTeamId: m.isHome ? ourTeam.id : teams[m.opp].id,
        awayTeamId: m.isHome ? teams[m.opp].id : ourTeam.id,
        homeScore: m.scoreUs, awayScore: m.scoreThem, status: m.status,
      }
    })
  }

  console.log('Загружаем новости...')
  const newsData = [
    { 
      tag: 'Матч', title: 'СКА-Нева обыграла «Волгу-Тверь» со счётом 2:1 в домашнем матче', excerpt: 'Голами отметились Иванов и Петров. Победа позволила нашей команде подняться на второе место в таблице.', dateStr: '11 октября 2026', author: 'Пресс-служба клуба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', 
      content: [
        'На «Нева-Арене» завершился матч 10-го тура ФНЛ-3, в котором СКА-Нева принимала «Волгу-Тверь». Игра получилась напряжённой и держала болельщиков в напряжении до финального свистка.',
        'Счёт открыл Никита Иванов на 34-й минуте — полузащитник откликнулся на подачу с фланга и точным ударом в дальний угол отправил мяч в сетку. Однако гости сумели отыграться через 10 минут после перерыва: Кузнецов воспользовался ошибкой в обороне и сравнял счёт.',
        'Победный гол забил Иван Петров на 78-й минуте. Воспитанник академии клуба откликнулся на прострел и в одно касание переправил мяч в ворота. Этот гол стал для нападающего четвёртым в сезоне.',
        'Главный тренер Диментий Диментьев после матча отметил характер команды: «Сегодня ребята показали, что умеют терпеть и играть до конца. Такие победы стоят дорого».',
        'Благодаря этой победе СКА-Нева поднялась на второе место в турнирной таблице, обойдя «Волгу-Кострому».'
      ] 
    },
    { 
      tag: 'Трансфер', title: 'Клуб подписал контракт с нападающим Алексеем Соколовым', excerpt: '27-летний форвард переходит из «Балтики-2». Соглашение рассчитано на три сезона.', dateStr: '9 октября 2026', author: 'Пресс-служба клуба', gradient: 'from-ska-blue via-[#0F2444] to-ska-navy', icon: '✍️', 
      content: [
        'ПФК «СКА-Нева» рад объявить о подписании контракта с нападающим Алексеем Соколовым. Соглашение с 27-летним форвардом рассчитано на три сезона.',
        'Алексей переходит из калининградской «Балтики-2», где в прошлом сезоне провёл 22 матча и забил 8 голов. Форвард известен своей скоростью, техникой и умением играть на грани офсайда.',
        '«Я рад присоединиться к такому клубу с богатой историей. СКА-Нева — команда с амбициями, и я хочу помочь ей добиться поставленных целей», — прокомментировал переход Соколов.',
        'Главный тренер Диментий Диментьев отметил, что Соколов — именно тот игрок, которого команде не хватало в атаке: «Он отлично вписывается в нашу модель игры. Быстрый, умный, с хорошим ударом. Уверен, он усилит конкуренцию в линии нападения».',
        'В дебютном матче за новый клуб Алексей уже успел отметиться дублем, что говорит о его хорошей форме.'
      ] 
    },
    { 
      tag: 'Интервью', title: 'Диментий Диментьев: «Мы играем в атакующий футбол и не боимся риска»', excerpt: 'Главный тренер — о философии команды, подготовке к дерби и работе с молодыми игроками.', dateStr: '7 октября 2026', author: 'Анна Соловьёва', gradient: 'from-emerald-800 via-[#0F2444] to-ska-navy', icon: '🎤', 
      content: [
        'Главный тренер СКА-Невы Диментий Диментьев ответил на вопросы клубной пресс-службы накануне важнейшего матча сезона.',
        '— Диментий Александрович, как вы оцениваете текущую форму команды?',
        '— Мы в хорошем тонусе. Последние матчи показали, что команда прогрессирует и прибавляет от игры к игре. Конечно, есть моменты, над которыми нужно работать, но общий настрой позитивный.',
        '— Ваша команда играет в атакующий футбол. Это принципиальная позиция?',
        '— Абсолютно. Я убеждён, что болельщики приходят на стадион ради голов и зрелища. Мы не боимся риска и всегда стараемся играть первым номером. Конечно, при этом важно соблюдать баланс между атакой и обороной.',
        '— Что скажете о молодых игроках?',
        '— У нас самая молодая команда в дивизионе. Средний возраст — 24 года. И это здорово! Ребята растут прямо на глазах. Матвей Лукальдини в 20 лет — капитан команды, и он справляется с этой ролью прекрасно.',
        '— Ваши цели на сезон?',
        '— Мы хотим выйти в ФНЛ-2. Это амбициозная цель, но мы верим в неё и работаем ради неё каждый день.'
      ] 
    },
    { 
      tag: 'Клуб', title: '«Нева-Арена» примет матч открытых дверей для болельщиков', excerpt: 'В следующую субботу стадион откроет двери для всех желающих — экскурсии, автограф-сессия, тренировка.', dateStr: '5 октября 2026', author: 'Пресс-служба клуба', gradient: 'from-purple-800 via-[#0F2444] to-ska-navy', icon: '🏟', 
      content: [
        'В субботу, 10 октября, «Нева-Арена» откроет двери для всех болельщиков клуба. Мероприятие приурочено к празднованию 80-летия со дня основания СКА-Невы.',
        'В программе дня:',
        '• Экскурсия по стадиону, включая раздевалки и тренерский штаб.',
        '• Открытая тренировка основного состава, после которой игроки проведут автограф-сессию.',
        '• Презентация новой клубной атрибутики.',
        '• Мастер-классы для юных футболистов.',
        '• Розыгрыш билетов на ближайший домашний матч.',
        'Вход на мероприятие свободный. Начало — в 14:00. Приходите всей семьёй — будет интересно и детям, и взрослым!'
      ] 
    },
    { 
      tag: 'Матч', title: 'Разгромное поражение в Выборге: 0:2 от «Замка»', excerpt: 'Несмотря на территориальное преимущество, реализовать моменты не удалось. Разбор матча от тренерского штаба.', dateStr: '4 октября 2026', author: 'Пресс-служба клуба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', 
      content: [
        'Выездной матч 9-го тура в Выборге завершился для СКА-Невы поражением со счётом 0:2. Это второе поражение команды в сезоне.',
        'Несмотря на то, что наша команда владела мячом 62% времени и нанесла 15 ударов по воротам (против 7 у соперника), реализовать моменты не удалось. Хозяева же использовали практически все свои шансы.',
        'Первый гол «Замок Выборг» забил на 28-й минуте после розыгрыша углового. Второй мяч влетел в наши ворота на 67-й минуте — снова после стандарта.',
        'Главный тренер Диментий Диментьев после матча был краток: «Мы проиграли в реализации моментов и в игре на стандартах. Это те компоненты, над которыми будем работать на тренировках на этой неделе. В остальном — движение и структура игры были правильными».',
        'Команда уже готовится к следующему матчу, который пройдёт на «Нева-Арене».'
      ] 
    },
    { 
      tag: 'Трансфер', title: 'Академия клуба выпустила пятерых игроков в основной состав', excerpt: 'Молодые воспитанники 2006–2007 года рождения подписали первые профессиональные контракты.', dateStr: '2 октября 2026', author: 'Пресс-служба клуба', gradient: 'from-ska-blue via-[#0F2444] to-ska-navy', icon: '✍️', 
      content: [
        'Пять воспитанников академии ПФК «СКА-Нева» подписали свои первые профессиональные контракты с клубом. Все они прошли полный путь от юношеских команд до основной.',
        'В число новичков вошли защитники Степан Давиташвили и Владислав Орлов, полузащитники Александр Соловьёв и Павел Фомин, а также нападающий Василий Баронов.',
        '«Это результат многолетней работы академии, — отметил спортивный директор Игорь Бельский. — Мы гордимся, что наши воспитанники получают шанс проявить себя на профессиональном уровне. Это одна из главных задач нашего клуба».',
        'Все пятеро уже успели дебютировать в составе основной команды в этом сезоне. Академия СКА-Невы — один из ведущих центров подготовки молодых футболистов в Северо-Западном регионе.'
      ] 
    },
    { 
      tag: 'Интервью', title: 'Матвей Лукальдини: «Капитанская повязка — это ответственность за каждого»', excerpt: 'Капитан команды — о лидерстве, атмосфере в раздевалке и целях на сезон.', dateStr: '30 сентября 2026', author: 'Анна Соловьёва', gradient: 'from-emerald-800 via-[#0F2444] to-ska-navy', icon: '🎤', 
      content: [
        'Капитан СКА-Невы Матвей Лукальдини — самый молодой капитан в истории клуба. В 20 лет он носит повязку и ведёт команду за собой.',
        '— Матвей, как ощущаешь себя в роли капитана?',
        '— Честно говоря, сначала было волнительно. Но партнёры и тренерский штаб поддержали меня с первого дня. Я понимаю, что капитанская повязка — это не только честь, но и огромная ответственность за каждого игрока в команде.',
        '— Какой стиль лидерства тебе ближе?',
        '— Я не из тех, кто много говорит. Стараюсь вести за собой примером — самоотдачей на тренировках, готовностью играть через боль, желанием побеждать в каждом эпизоде. И, конечно, всегда готов поддержать партнёра.',
        '— Какие цели у команды на сезон?',
        '— У нас одна цель — выход в ФНЛ-2. Мы знаем, что это сложно, но не боимся. У нас молодая, голодная до побед команда. И самое главное — у нас есть характер.'
      ] 
    },
    { 
      tag: 'Клуб', title: 'ПФК «СКА-Нева» и «Балтийская Верфь» продлили сотрудничество', excerpt: 'Титульный спонсор клуба остаётся с командой ещё на три сезона. Подробности соглашения — в материале.', dateStr: '28 сентября 2026', author: 'Пресс-служба клуба', gradient: 'from-purple-800 via-[#0F2444] to-ska-navy', icon: '🏟', 
      content: [
        'ПФК «СКА-Нева» и компания «Балтийская Верфь» объявили о продлении соглашения о титульном спонсорстве. Новый контракт рассчитан на три сезона — до конца 2029 года.',
        '«Балтийская Верфь» — одна из крупнейших судостроительных компаний Северо-Запада. Сотрудничество с клубом началось в 2015 году и стало важным фактором возрождения команды.',
        '«Мы рады продолжить наше партнёрство с клубом, — отметил генеральный директор „Балтийской Верфи“ Сергей Морозов. — СКА-Нева — это команда с характером и историей. Мы верим в её будущее и готовы поддерживать развитие как основного состава, так и академии».',
        'В рамках нового соглашения планируется расширение сотрудничества, включая совместные социальные проекты и развитие инфраструктуры.'
      ] 
    },
    { 
      tag: 'Матч', title: 'Уверенная победа над «Молотом» — 2:0', excerpt: 'Дубль Петрова и «сухой» матч Белова принесли три очка на «Нева-Арене».', dateStr: '27 сентября 2026', author: 'Пресс-служба клуба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', 
      content: [
        'В матче 8-го тура ФНЛ-3 СКА-Нева на своём поле уверенно обыграла «Молот Нижний Тагил» со счётом 2:0.',
        'Оба мяча забил Иван Петров — на 23-й и 61-й минутах. Первый гол нападающий забил после передачи Максима Кузнецова, второй — после индивидуального прохода.',
        'Вратарь Артём Белов провёл свой третий «сухой» матч в сезоне, отразив несколько опасных ударов. Оборона команды во главе с капитаном Матвеем Лукальдини действовала надёжно.',
        '«Мы провели один из лучших матчей в сезоне, — прокомментировал игру главный тренер Диментий Диментьев. — Движение, дисциплина, реализация моментов — всё было на высоком уровне».'
      ] 
    },
  ]
  
  await prisma.news.createMany({ data: newsData })

  console.log('✅ База полностью заполнена! Новости и города исправлены.')
}



main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })