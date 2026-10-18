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

  console.log('Загружаем команды...')
  const teamsData = [
    { name: 'Волга-Тверь', city: 'Тверь', shortName: 'ВТ', color: 'from-slate-500 to-slate-700', isOurTeam: false },
    { name: 'СКА-Нева', city: 'Санкт-Петербург', shortName: 'СКА', color: 'from-ska-red to-ska-blue', isOurTeam: true },
    { name: 'Волга-Кострома', city: 'Кострома', shortName: 'ВК', color: 'from-blue-800 to-blue-950', isOurTeam: false },
    { name: 'Заря Балтийск', city: 'Балтийск', shortName: 'ЗБ', color: 'from-sky-700 to-blue-900', isOurTeam: false },
    { name: 'Шторм', city: 'Санкт-Петербург', shortName: 'ШТ', color: 'from-sky-500 to-blue-700', isOurTeam: false },
    { name: 'Лев Владимир', city: 'Владимир', shortName: 'ЛВ', color: 'from-slate-600 to-slate-800', isOurTeam: false },
    { name: 'Молот Нижний Тагил', city: 'Нижний Тагил', shortName: 'МН', color: 'from-red-700 to-red-900', isOurTeam: false },
    { name: 'Замок Выборг', city: 'Выборг', shortName: 'ЗВ', color: 'from-indigo-700 to-indigo-900', isOurTeam: false },
    { name: 'Курск', city: 'Курск', shortName: 'КР', color: 'from-blue-600 to-blue-800', isOurTeam: false },
    { name: 'Красноярск', city: 'Красноярск', shortName: 'КЯ', color: 'from-orange-600 to-orange-800', isOurTeam: false },
    { name: 'Маяк Ульяновск', city: 'Ульяновск', shortName: 'МУ', color: 'from-emerald-700 to-emerald-900', isOurTeam: false },
    { name: 'Барс Алания', city: 'Владикавказ', shortName: 'БА', color: 'from-yellow-600 to-yellow-800', isOurTeam: false },
    { name: 'Луч Новосибирск', city: 'Новосибирск', shortName: 'ЛН', color: 'from-cyan-700 to-cyan-900', isOurTeam: false },
    { name: 'Амур', city: 'Комсомольск-на-Амуре', shortName: 'АМ', color: 'from-teal-700 to-teal-900', isOurTeam: false },
    { name: 'Сахалин', city: 'Южно-Сахалинск', shortName: 'СХ', color: 'from-green-700 to-green-900', isOurTeam: false },
    { name: 'Элиста', city: 'Элиста', shortName: 'ЭЛ', color: 'from-purple-700 to-purple-950', isOurTeam: false },
  ]

  const teams: Record<string, any> = {}
  for (const t of teamsData) {
    teams[t.name] = await prisma.team.create({ data: t })
  }
  const ourTeam = teams['СКА-Нева']

  console.log('Загружаем таблицу...')
  const standingsData = [
    { position: 1, name: 'Волга-Тверь', played: 11, wins: 7, draws: 1, losses: 3, goalsFor: 18, goalsAgainst: 10, points: 22 },
    { position: 2, name: 'СКА-Нева', played: 11, wins: 6, draws: 2, losses: 3, goalsFor: 17, goalsAgainst: 11, points: 20 },
    { position: 3, name: 'Волга-Кострома', played: 11, wins: 5, draws: 4, losses: 2, goalsFor: 15, goalsAgainst: 10, points: 19 },
    { position: 4, name: 'Заря Балтийск', played: 11, wins: 5, draws: 3, losses: 3, goalsFor: 14, goalsAgainst: 12, points: 18 },
    { position: 5, name: 'Шторм', played: 11, wins: 4, draws: 3, losses: 4, goalsFor: 13, goalsAgainst: 13, points: 15 },
    { position: 6, name: 'Лев Владимир', played: 11, wins: 3, draws: 3, losses: 5, goalsFor: 11, goalsAgainst: 15, points: 12 },
    { position: 7, name: 'Молот Нижний Тагил', played: 11, wins: 2, draws: 4, losses: 5, goalsFor: 10, goalsAgainst: 16, points: 10 },
    { position: 8, name: 'Замок Выборг', played: 11, wins: 1, draws: 5, losses: 5, goalsFor: 9, goalsAgainst: 17, points: 8 },
    { position: 9, name: 'Курск', played: 11, wins: 2, draws: 2, losses: 7, goalsFor: 10, goalsAgainst: 19, points: 8 },
    { position: 10, name: 'Красноярск', played: 11, wins: 1, draws: 4, losses: 6, goalsFor: 8, goalsAgainst: 18, points: 7 },
    { position: 11, name: 'Маяк Ульяновск', played: 11, wins: 1, draws: 4, losses: 6, goalsFor: 7, goalsAgainst: 17, points: 7 },
    { position: 12, name: 'Барс Алания', played: 11, wins: 1, draws: 3, losses: 7, goalsFor: 9, goalsAgainst: 20, points: 6 },
    { position: 13, name: 'Луч Новосибирск', played: 11, wins: 1, draws: 2, losses: 8, goalsFor: 8, goalsAgainst: 21, points: 5 },
    { position: 14, name: 'Амур', played: 11, wins: 1, draws: 1, losses: 9, goalsFor: 6, goalsAgainst: 22, points: 4 },
    { position: 15, name: 'Сахалин', played: 11, wins: 0, draws: 3, losses: 8, goalsFor: 5, goalsAgainst: 20, points: 3 },
    { position: 16, name: 'Элиста', played: 11, wins: 0, draws: 2, losses: 9, goalsFor: 4, goalsAgainst: 24, points: 2 },
  ]
  for (const s of standingsData) {
    await prisma.standing.create({
      data: {
        teamId: teams[s.name].id, season: '2025/26', position: s.position,
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
    { number: 1, name: 'Артём Белов', position: 'Вратарь', age: 28, height: 190, weight: 84, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2021', isCaptain: false, bio: 'Воспитанник петербургской школы футбола.' },
    { number: 27, name: 'Константин Финов', position: 'Вратарь', age: 22, height: 187, weight: 80, foot: 'Правый', birthplace: 'Великий Новгород', joinedAt: '2023', isCaptain: false, bio: 'Молодой голкипер.' },
    { number: 35, name: 'Максим Ветров', position: 'Вратарь', age: 19, height: 185, weight: 76, foot: 'Правый', birthplace: 'Колпино', joinedAt: '2025', isCaptain: false, bio: 'Воспитанник академии.' },
    { number: 4, name: 'Матвей Лукальдини', position: 'Защитник', age: 20, height: 188, weight: 80, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2024', isCaptain: true, bio: 'Самый молодой капитан.' },
    { number: 2, name: 'Даниил Творогов', position: 'Защитник', age: 26, height: 182, weight: 77, foot: 'Правый', birthplace: 'Мурманск', joinedAt: '2022', isCaptain: false, bio: 'Правый защитник.' },
    { number: 3, name: 'Игорь Невский', position: 'Защитник', age: 24, height: 185, weight: 79, foot: 'Левый', birthplace: 'Выборг', joinedAt: '2023', isCaptain: false, bio: 'Левый защитник.' },
    { number: 5, name: 'Роман Волков', position: 'Защитник', age: 27, height: 186, weight: 82, foot: 'Правый', birthplace: 'Калининград', joinedAt: '2021', isCaptain: false, bio: 'Опытный центральный защитник.' },
    { number: 6, name: 'Сергей Березуцкий', position: 'Защитник', age: 23, height: 180, weight: 75, foot: 'Правый', birthplace: 'Тверь', joinedAt: '2024', isCaptain: false, bio: 'Универсальный защитник.' },
    { number: 13, name: 'Кирилл Зайцев', position: 'Защитник', age: 25, height: 184, weight: 78, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2022', isCaptain: false, bio: 'Быстрый защитник.' },
    { number: 22, name: 'Владислав Орлов', position: 'Защитник', age: 21, height: 179, weight: 73, foot: 'Левый', birthplace: 'Колпино', joinedAt: '2025', isCaptain: false, bio: 'Молодой воспитанник.' },
    { number: 44, name: 'Степан Давиташвили', position: 'Защитник', age: 20, height: 183, weight: 77, foot: 'Правый', birthplace: 'Сочи', joinedAt: '2025', isCaptain: false, bio: 'Перспективный защитник.' },
    { number: 8, name: 'Никита Иванов', position: 'Полузащитник', age: 25, height: 178, weight: 72, foot: 'Правый', birthplace: 'Тверь', joinedAt: '2022', isCaptain: false, bio: 'Центральный полузащитник.' },
    { number: 10, name: 'Максим Кузнецов', position: 'Полузащитник', age: 28, height: 176, weight: 70, foot: 'Левый', birthplace: 'Москва', joinedAt: '2023', isCaptain: false, bio: 'Плеймейкер команды.' },
    { number: 7, name: 'Антон Смирнов', position: 'Полузащитник', age: 23, height: 180, weight: 74, foot: 'Правый', birthplace: 'Вологда', joinedAt: '2023', isCaptain: false, bio: 'Атакующий полузащитник.' },
    { number: 14, name: 'Дмитрий Бут', position: 'Полузащитник', age: 26, height: 175, weight: 71, foot: 'Правый', birthplace: 'Псков', joinedAt: '2022', isCaptain: false, bio: 'Опорный полузащитник.' },
    { number: 17, name: 'Александр Соловьёв', position: 'Полузащитник', age: 22, height: 177, weight: 72, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2024', isCaptain: false, bio: 'Молодой центральный полузащитник.' },
    { number: 20, name: 'Павел Фомин', position: 'Полузащитник', age: 24, height: 179, weight: 73, foot: 'Левый', birthplace: 'Выборг', joinedAt: '2024', isCaptain: false, bio: 'Левый полузащитник.' },
    { number: 9, name: 'Алексей Соколов', position: 'Нападающий', age: 27, height: 185, weight: 80, foot: 'Правый', birthplace: 'Калининград', joinedAt: '2025', isCaptain: false, bio: 'Новичок сезона.' },
    { number: 11, name: 'Иван Петров', position: 'Нападающий', age: 24, height: 182, weight: 78, foot: 'Правый', birthplace: 'Выборг', joinedAt: '2020', isCaptain: false, bio: 'Воспитанник академии.' },
    { number: 19, name: 'Сергей Лебедев', position: 'Нападающий', age: 29, height: 187, weight: 83, foot: 'Правый', birthplace: 'Петрозаводск', joinedAt: '2023', isCaptain: false, bio: 'Опытный форвард.' },
    { number: 77, name: 'Василий Баронов', position: 'Нападающий', age: 21, height: 181, weight: 76, foot: 'Левый', birthplace: 'Колпино', joinedAt: '2024', isCaptain: false, bio: 'Скоростной нападающий.' },
    { number: 99, name: 'Дмитрий Снегов', position: 'Нападающий', age: 20, height: 184, weight: 78, foot: 'Правый', birthplace: 'Санкт-Петербург', joinedAt: '2025', isCaptain: false, bio: 'Самый молодой нападающий.' },
  ]

  for (const p of playersData) {
    const player = await prisma.player.create({ data: { ...p, teamId: ourTeam.id } })
    await prisma.playerStat.create({
      data: { playerId: player.id, season: '2025/26', matches: 11, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
    })
  }

  console.log('Загружаем матчи...')
  const matchesData = [
    // Прошедшие
    { tour: 10, dateStr: '11 октября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Волга-Тверь', scoreUs: 2, scoreThem: 1, status: 'finished' },
    { tour: 9, dateStr: '4 октября 2026', time: '17:00', stadium: 'Стадион «Авангард»', isHome: false, opp: 'Замок Выборг', scoreUs: 0, scoreThem: 2, status: 'finished' },
    { tour: 8, dateStr: '27 сентября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Молот Нижний Тагил', scoreUs: 2, scoreThem: 0, status: 'finished' },
    { tour: 7, dateStr: '20 сентября 2026', time: '16:00', stadium: 'Стадион «Торпедо»', isHome: false, opp: 'Лев Владимир', scoreUs: 1, scoreThem: 2, status: 'finished' },
    { tour: 6, dateStr: '13 сентября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Шторм', scoreUs: 1, scoreThem: 2, status: 'finished' },
    { tour: 5, dateStr: '6 сентября 2026', time: '19:00', stadium: 'Стадион «Балтика»', isHome: false, opp: 'Заря Балтийск', scoreUs: 2, scoreThem: 2, status: 'finished' },
    { tour: 4, dateStr: '30 августа 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Волга-Кострома', scoreUs: 2, scoreThem: 0, status: 'finished' },
    { tour: 3, dateStr: '23 августа 2026', time: '17:00', stadium: 'Стадион «Волга»', isHome: false, opp: 'Волга-Тверь', scoreUs: 2, scoreThem: 1, status: 'finished' },
    { tour: 2, dateStr: '16 августа 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Замок Выборг', scoreUs: 3, scoreThem: 1, status: 'finished' },
    { tour: 1, dateStr: '9 августа 2026', time: '17:00', stadium: 'Стадион «Локомотив»', isHome: false, opp: 'Красноярск', scoreUs: 1, scoreThem: 1, status: 'finished' },
    // Предстоящие
    { tour: 11, dateStr: '17 октября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Волга-Кострома', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 12, dateStr: '24 октября 2026', time: '17:00', stadium: 'Стадион «Балтика»', isHome: false, opp: 'Заря Балтийск', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 13, dateStr: '31 октября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Шторм', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 14, dateStr: '7 ноября 2026', time: '16:00', stadium: 'Стадион «Торпедо»', isHome: false, opp: 'Лев Владимир', scoreUs: null, scoreThem: null, status: 'upcoming' },
    { tour: 15, dateStr: '14 ноября 2026', time: '18:00', stadium: '«Нева-Арена»', isHome: true, opp: 'Барс Алания', scoreUs: null, scoreThem: null, status: 'upcoming' },
  ]

  for (const m of matchesData) {
    await prisma.match.create({
      data: {
        tour: m.tour,
        tournament: 'ФНЛ-3',
        dateStr: m.dateStr,
        time: m.time,
        stadium: m.stadium,
        homeTeamId: m.isHome ? ourTeam.id : teams[m.opp].id,
        awayTeamId: m.isHome ? teams[m.opp].id : ourTeam.id,
        homeScore: m.scoreUs,
        awayScore: m.scoreThem,
        status: m.status,
      }
    })
  }

  console.log('Загружаем новости...')
  const newsData = [
    { tag: 'Матч', title: 'СКА-Нева обыграла «Волгу-Тверь» со счётом 2:1 в домашнем матче', excerpt: 'Голами отметились Иванов и Петров.', dateStr: '11 октября 2026', author: 'Пресс-служба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', content: ['На «Нева-Арене» завершился матч...', 'Победный гол забил Иван Петров...'] },
    { tag: 'Трансфер', title: 'Клуб подписал контракт с нападающим Алексеем Соколовым', excerpt: '27-летний форвард переходит из «Балтики-2».', dateStr: '9 октября 2026', author: 'Пресс-служба', gradient: 'from-ska-blue via-[#0F2444] to-ska-navy', icon: '✍️', content: ['ПФК «СКА-Нева» рад объявить...', 'Алексей переходит из калининградской...'] },
    { tag: 'Интервью', title: 'Диментий Диментьев: «Мы играем в атакующий футбол»', excerpt: 'Главный тренер — о философии команды.', dateStr: '7 октября 2026', author: 'Анна Соловьёва', gradient: 'from-emerald-800 via-[#0F2444] to-ska-navy', icon: '🎤', content: ['Главный тренер СКА-Невы ответил...', '— Мы в хорошем тонусе...'] },
    { tag: 'Клуб', title: '«Нева-Арена» примет матч открытых дверей', excerpt: 'Стадион откроет двери для всех желающих.', dateStr: '5 октября 2026', author: 'Пресс-служба', gradient: 'from-purple-800 via-[#0F2444] to-ska-navy', icon: '🏟', content: ['В субботу, 10 октября, «Нева-Арена»...', 'В программе дня:'] },
    { tag: 'Матч', title: 'Разгромное поражение в Выборге: 0:2 от «Замка»', excerpt: 'Несмотря на преимущество, реализовать моменты не удалось.', dateStr: '4 октября 2026', author: 'Пресс-служба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', content: ['Выездной матч 9-го тура...', 'Несмотря на то, что наша команда...'] },
    { tag: 'Трансфер', title: 'Академия клуба выпустила пятерых игроков в основной состав', excerpt: 'Молодые воспитанники подписали первые контракты.', dateStr: '2 октября 2026', author: 'Пресс-служба', gradient: 'from-ska-blue via-[#0F2444] to-ska-navy', icon: '✍️', content: ['Пять воспитанников академии...', 'В число новичков вошли...'] },
    { tag: 'Интервью', title: 'Матвей Лукальдини: «Капитанская повязка — это ответственность»', excerpt: 'Капитан команды — о лидерстве.', dateStr: '30 сентября 2026', author: 'Анна Соловьёва', gradient: 'from-emerald-800 via-[#0F2444] to-ska-navy', icon: '🎤', content: ['Капитан СКА-Невы Матвей Лукальдини...', '— Матвей, как ощущаешь себя...'] },
    { tag: 'Клуб', title: 'ПФК «СКА-Нева» и «Балтийская Верфь» продлили сотрудничество', excerpt: 'Титульный спонсор остаётся с командой на три сезона.', dateStr: '28 сентября 2026', author: 'Пресс-служба', gradient: 'from-purple-800 via-[#0F2444] to-ska-navy', icon: '🏟', content: ['ПФК «СКА-Нева» и компания...', '«Балтийская Верфь» — одна из...'] },
    { tag: 'Матч', title: 'Уверенная победа над «Молотом» — 2:0', excerpt: 'Дубль Петрова и «сухой» матч Белова.', dateStr: '27 сентября 2026', author: 'Пресс-служба', gradient: 'from-ska-red via-[#8B0A1F] to-ska-navy', icon: '⚽', content: ['В матче 8-го тура ФНЛ-3...', 'Оба мяча забил Иван Петров...'] },
  ]
  await prisma.news.createMany({ data: newsData })

  console.log('✅ База полностью заполнена! Игроки, тренеры, матчи, таблица и новости в БД.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })