export const STAT_KEYS = [
  'home_question',
  'home_calculators',
  'home_metiers',
  'calculator_primes',
  'calculator_cia',
  'calculator_13eme',
] as const

export type StatKey = (typeof STAT_KEYS)[number]

export interface StatDefinition {
  key: StatKey
  label: string
  group: 'home' | 'calculators'
}

interface StoredStats {
  weekKey: string
  counters: Record<StatKey, number>
}

const STORAGE_KEY = 'admin_weekly_stats'

export const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'home_question', label: "J'ai une question IA", group: 'home' },
  { key: 'home_calculators', label: 'Calculateurs', group: 'home' },
  { key: 'home_metiers', label: 'Grilles indiciaires', group: 'home' },
  { key: 'calculator_primes', label: 'Calculateur primes', group: 'calculators' },
  { key: 'calculator_cia', label: 'Calculateur CIA', group: 'calculators' },
  { key: 'calculator_13eme', label: 'Calculateur 13ème mois', group: 'calculators' },
]

const buildEmptyCounters = (): Record<StatKey, number> => ({
  home_question: 0,
  home_calculators: 0,
  home_metiers: 0,
  calculator_primes: 0,
  calculator_cia: 0,
  calculator_13eme: 0,
})

const getWeekKey = (date = new Date()): string => {
  const current = new Date(date)
  const day = (current.getDay() + 6) % 7
  current.setHours(0, 0, 0, 0)
  current.setDate(current.getDate() - day + 3)

  const firstThursday = new Date(current.getFullYear(), 0, 4)
  const firstDay = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3)

  const diff = current.getTime() - firstThursday.getTime()
  const weekNumber = 1 + Math.round(diff / 604800000)

  return `${current.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

const getFreshState = (): StoredStats => ({
  weekKey: getWeekKey(),
  counters: buildEmptyCounters(),
})

const sanitizeCounters = (value: Partial<Record<StatKey, number>> | undefined): Record<StatKey, number> => {
  const counters = buildEmptyCounters()

  if (!value) return counters

  for (const key of STAT_KEYS) {
    const count = value[key]
    counters[key] = typeof count === 'number' && count >= 0 ? count : 0
  }

  return counters
}

const readState = (): StoredStats => {
  if (typeof window === 'undefined') return getFreshState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getFreshState()

    const parsed = JSON.parse(raw) as Partial<StoredStats>
    const currentWeek = getWeekKey()

    if (parsed.weekKey !== currentWeek) {
      return { weekKey: currentWeek, counters: buildEmptyCounters() }
    }

    return {
      weekKey: currentWeek,
      counters: sanitizeCounters(parsed.counters),
    }
  } catch {
    return getFreshState()
  }
}

const writeState = (state: StoredStats) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const getWeeklyStats = (): StoredStats => {
  const state = readState()
  writeState(state)
  return state
}

export const incrementWeeklyStat = (key: StatKey) => {
  const state = getWeeklyStats()
  const nextState = {
    ...state,
    counters: {
      ...state.counters,
      [key]: state.counters[key] + 1,
    },
  }

  writeState(nextState)
  return nextState
}

export const resetWeeklyStat = (key: StatKey) => {
  const state = getWeeklyStats()
  const nextState = {
    ...state,
    counters: {
      ...state.counters,
      [key]: 0,
    },
  }

  writeState(nextState)
  return nextState
}

export const resetAllWeeklyStats = () => {
  const state = getFreshState()
  writeState(state)
  return state
}