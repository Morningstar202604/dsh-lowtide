import { describe, expect, test } from 'vitest'
import { addDaysInTz, dayStartInTz, levelAt, localParts, minutesUntil, nextBatchAt, nextOffPeakStart, systemTimeZone, windowsInTz } from '../src/windows.ts'
import { OFFICIAL_PEAK_WINDOWS, cost, costAtRow, hasPriceEntry, OFFICIAL_PRICES, estimate, rowForLevel, tierFor } from '../src/pricing.ts'
import { defaultConfig } from '../src/model.ts'

const PEAK = OFFICIAL_PEAK_WINDOWS

/** Beijing 09:00–12:00 / 14:00–18:00 peak; everything else off. */
function beijingTime(h: number, m = 0, weekday?: number): Date {
  const d = new Date('2026-08-17T00:00:00Z') // a Monday, 08:00 Beijing
  d.setUTCHours(h - 8, m, 0, 0)
  if (weekday !== undefined) {
    // shift to the requested weekday (1=Mon)
    const current = 1
    d.setUTCDate(d.getUTCDate() + (weekday - current))
  }
  return d
}

describe('windows.levelAt', () => {
  test('09:00:00 sharp is peak (half-open boundary)', () => {
    expect(levelAt(beijingTime(9, 0), PEAK)?.level).toBe('peak')
  })

  test('08:59 is off, 12:00 sharp is off, 14:00 sharp is peak, 18:00 sharp is off', () => {
    expect(levelAt(beijingTime(8, 59), PEAK)?.level ?? 'off').toBe('off')
    expect(levelAt(beijingTime(12, 0), PEAK)?.level ?? 'off').toBe('off')
    expect(levelAt(beijingTime(14, 0), PEAK)?.level).toBe('peak')
    expect(levelAt(beijingTime(18, 0), PEAK)?.level ?? 'off').toBe('off')
  })

  test('19:00 evening is off (the new half-price mental model)', () => {
    expect(levelAt(beijingTime(19, 0), PEAK)?.level ?? 'off').toBe('off')
  })

  test('weekend is always off-peak even during Beijing peak hours (2026-08-23 rule)', () => {
    // Saturday 10:00 Beijing — would be peak under the old rule, but
    // weekends are entirely off-peak since 2026-08-23.
    expect(levelAt(beijingTime(10, 0, 6), PEAK)).toBeNull()
    // Sunday 15:00 Beijing — same: off-peak all day on weekends.
    expect(levelAt(beijingTime(15, 0, 7), PEAK)).toBeNull()
    // Monday 10:00 Beijing — weekday peak still works.
    expect(levelAt(beijingTime(10, 0, 1), PEAK)?.level).toBe('peak')
  })

  test('per-weekday windows skip non-listed days', () => {
    const windows = [{ id: 'w', level: 'off' as const, start: '00:00', end: '23:59', days: [2, 4], tz: 'Asia/Shanghai' }]
    expect(levelAt(beijingTime(10, 0, 2), windows)).not.toBeNull()
    expect(levelAt(beijingTime(10, 0, 3), windows)).toBeNull()
  })

  test('midnight-crossing window 23:00–01:00 matches at 00:30', () => {
    const windows = [{ id: 'night', level: 'off' as const, start: '23:00', end: '01:00', tz: 'Asia/Shanghai' }]
    expect(levelAt(beijingTime(0, 30), windows)?.level).toBe('off')
    expect(levelAt(beijingTime(12, 0), windows)).toBeNull()
  })

  test('timezone conversion: 09:00 Beijing is 20:00 NY (previous day) — off for a NY-local window', () => {
    const local = [{ id: 'local', level: 'peak' as const, start: '09:00', end: '10:00', tz: 'America/New_York' }]
    const when = beijingTime(9, 0) // 2026-08-17 01:00 UTC = 21:00 NY on the 16th
    expect(levelAt(when, local)).toBeNull()
    const nyMorning = new Date('2026-08-17T13:00:00Z') // 09:00 NY
    expect(levelAt(nyMorning, local)?.level).toBe('peak')
  })

  test('official peak window read in a NY system: displayed peak shifts to local time', () => {
    const when = new Date('2026-08-17T01:00:00Z') // 09:00 Beijing = 21:00 NY previous day
    const match = levelAt(when, PEAK)
    expect(match?.level).toBe('peak')
  })

  test('array order = precedence: first matching window wins', () => {
    const windows = [
      { id: 'a', level: 'peak' as const, start: '00:00', end: '23:59', tz: 'Asia/Shanghai' },
      { id: 'b', level: 'off' as const, start: '00:00', end: '23:59', tz: 'Asia/Shanghai' },
    ]
    expect(levelAt(beijingTime(10), windows)?.window.id).toBe('a')
  })

  test('systemTimeZone returns an IANA name', () => {
    expect(systemTimeZone()).toMatch(/^[A-Za-z_/+-]+/)
  })
})

describe('windows.nextOffPeakStart / nextBatchAt / minutesUntil', () => {
  test('inside morning peak, next off start = the peak end 12:00', () => {
    const when = beijingTime(10, 30) // inside morning peak
    const next = nextOffPeakStart(when, PEAK)
    expect(next).not.toBeNull()
    expect(next!.getTime()).toBe(beijingTime(12, 0).getTime())
  })

  test('inside afternoon peak, next off start = 18:00', () => {
    const when = beijingTime(15, 0)
    const next = nextOffPeakStart(when, PEAK)
    expect(next!.getTime()).toBe(beijingTime(18, 0).getTime())
  })

  test('already off (19:05) — returns the same moment', () => {
    const when = beijingTime(19, 5)
    expect(nextOffPeakStart(when, PEAK)!.getTime()).toBe(when.getTime())
  })

  test('midnight-crossing peak 23:00–01:00: at 23:30 next off is 01:00 the next day', () => {
    const windows = [{ id: 'night-peak', level: 'peak' as const, start: '23:00', end: '01:00', tz: 'Asia/Shanghai' }]
    const when = beijingTime(23, 30)
    const next = nextOffPeakStart(when, windows)
    expect(next).not.toBeNull()
    expect(next!.getTime()).toBe(beijingTime(1, 0).getTime() + 86_400_000)
  })

  test('nextBatchAt is today when before the window, tomorrow when past it', () => {
    const batch = { window: '19:00-23:30', tz: 'Asia/Shanghai', gateLeadMin: 30 }
    const morning = beijingTime(9)
    expect(minutesUntil(morning, nextBatchAt(morning, batch))).toBe(600)
    const late = beijingTime(23, 0)
    expect(minutesUntil(late, nextBatchAt(late, batch))).toBe(20 * 60)
  })
})

describe('pricing.cost', () => {
  test('off-peak flash, 0% cached: 2M in + 60K out = ¥3.27 (PLAN §0.5 example)', () => {
    const usage = { input: 2_000_000, cacheRead: 0, output: 60_000 }
    const c = cost(usage, 'deepseek-v4-flash', beijingTime(19, 0), PEAK, OFFICIAL_PRICES)
    expect(c).toBeCloseTo(3.27, 2)
  })

  test('peak flash, 0% cached: same usage = ¥6.54', () => {
    const usage = { input: 2_000_000, cacheRead: 0, output: 60_000 }
    const c = cost(usage, 'deepseek-v4-flash', beijingTime(10, 0), PEAK, OFFICIAL_PRICES)
    expect(c).toBeCloseTo(6.54, 2)
  })

  test('50% cache hit (PLAN §0.5 caveat): off = ¥1.82, peak = ¥3.64', () => {
    const usage = { input: 1_000_000, cacheRead: 1_000_000, output: 60_000 }
    expect(cost(usage, 'deepseek-v4-flash', beijingTime(19, 0), PEAK, OFFICIAL_PRICES)).toBeCloseTo(1.82, 2)
    expect(cost(usage, 'deepseek-v4-flash', beijingTime(10, 0), PEAK, OFFICIAL_PRICES)).toBeCloseTo(3.64, 2)
  })

  test('reasoning tokens are NOT double-counted (output already includes them)', () => {
    const usage = { input: 253, cacheRead: 384, output: 1649, reasoning: 1392 }
    const c = cost(usage, 'deepseek-v4-flash', beijingTime(2, 0), PEAK, OFFICIAL_PRICES)
    // (253×1.5 + 384×0.05 + 1649×4.5)/1e6
    expect(c).toBeCloseTo((253 * 1.5 + 384 * 0.05 + 1649 * 4.5) / 1_000_000, 6)
  })

  test('custom window multiplier scales the off base', () => {
    const windows = [{ id: 'c', level: 'custom' as const, start: '00:00', end: '23:59', tz: 'Asia/Shanghai', multiplier: 3 }]
    const usage = { input: 1_000_000, output: 0, cacheRead: 0 }
    expect(cost(usage, 'deepseek-v4-flash', beijingTime(5), windows, OFFICIAL_PRICES)).toBeCloseTo(4.5, 2)
  })

  test('unknown model falls back to the flash tier instead of throwing (UI stays alive)', () => {
    // display price = charge price, even for models without a price entry
    const when = beijingTime(10, 0) // peak
    const usage = { input: 1_000_000, output: 0, cacheRead: 0 }
    const tier = tierFor('some-unknown-model')
    const match = levelAt(when, PEAK)
    const row = rowForLevel(tier, match?.level ?? null, match?.multiplier ?? 1)
    const displayed = (usage.input * row.input) / 1_000_000
    expect(displayed).toBeCloseTo(cost(usage, 'some-unknown-model', when, PEAK), 6)
    expect(hasPriceEntry('some-unknown-model')).toBe(false)
    expect(hasPriceEntry('deepseek-v4-flash')).toBe(true)
  })
})

describe('pricing.rowForLevel (display = charge)', () => {
  test('off / null level shows the off row', () => {
    const tier = tierFor('deepseek-v4-flash')
    expect(rowForLevel(tier, null)).toEqual(tier.off)
    expect(rowForLevel(tier, 'off')).toEqual(tier.off)
  })

  test('peak level shows the peak row', () => {
    const tier = tierFor('deepseek-v4-flash')
    expect(rowForLevel(tier, 'peak')).toEqual(tier.peak)
  })

  test('custom level = off row × multiplier, and matches cost() at any moment', () => {
    const windows = [{ id: 'c', level: 'custom' as const, start: '00:00', end: '23:59', tz: 'Asia/Shanghai', multiplier: 1.5 }]
    const tier = tierFor('deepseek-v4-flash')
    const row = rowForLevel(tier, 'custom', 1.5)
    expect(row.input).toBeCloseTo(tier.off.input * 1.5, 6)
    expect(row.output).toBeCloseTo(tier.off.output * 1.5, 6)
    const usage = { input: 1_000_000, output: 60_000, cacheRead: 0 }
    const displayed = (usage.input * row.input + usage.output * row.output) / 1_000_000
    expect(displayed).toBeCloseTo(cost(usage, 'deepseek-v4-flash', beijingTime(5), windows), 6)
  })
})

describe('pricing.estimate', () => {
  test('rough estimate is input-bound', () => {
    const e = estimate('hello world' + 'x'.repeat(100), [], 'deepseek-v4-flash')
    expect(e.off).toBeGreaterThan(0)
    expect(e.peak).toBeCloseTo(e.off * 2, 6)
  })
})

describe('windows.windowsInTz (official Beijing calendar → local clock)', () => {
  const probe = new Date('2026-08-17T00:00:00Z') // Monday 08:00 Beijing

  test('identity: Asia/Shanghai keeps official times, no crossing', () => {
    const out = windowsInTz(OFFICIAL_PEAK_WINDOWS, 'Asia/Shanghai', probe)
    expect(out.map((w) => [w.start, w.end, w.crossesDay])).toEqual([
      ['09:00', '12:00', false],
      ['14:00', '18:00', false],
    ])
  })

  test('Los Angeles (UTC-7 in August): morning peak lands the previous evening', () => {
    const out = windowsInTz(OFFICIAL_PEAK_WINDOWS, 'America/Los_Angeles', probe)
    expect(out[0]).toEqual({ label: '官方早高峰', start: '18:00', end: '21:00', crossesDay: false, days: [1, 2, 3, 4, 5] })
    expect(out[1]).toEqual({ label: '官方午高峰', start: '23:00', end: '03:00', crossesDay: true, days: [1, 2, 3, 4, 5] })
  })

  test('midnight-crossing source window keeps its next-day end after conversion', () => {
    const crossing = [{ id: 'night', label: '夜', level: 'off' as const, start: '22:00', end: '02:00', tz: 'Asia/Shanghai' }]
    const out = windowsInTz(crossing, 'Asia/Shanghai', probe)
    expect(out[0]).toEqual({ label: '夜', start: '22:00', end: '02:00', crossesDay: true })
  })
})

describe('windows.DST safety (Kimi review)', () => {
  // US DST 2026: spring forward Sun 2026-03-08 02:00→03:00 (23h day);
  // fall back Sun 2026-11-01 02:00→01:00 (25h day). Los Angeles = UTC-7/UTC-8.
  const LA = 'America/Los_Angeles'

  test('dayStartInTz lands on 00:00 across the spring-forward day', () => {
    const probe = new Date('2026-03-08T12:00:00Z') // 05:00 LA
    const start = dayStartInTz(probe, LA)
    expect(localParts(start, LA).minutes).toBe(0)
    expect(localParts(start, LA).weekday).toBe(7) // Sunday Mar 8
  })

  test('dayStartInTz lands on 00:00 across the fall-back day', () => {
    const probe = new Date('2026-11-01T12:00:00Z') // 04:00 LA
    const start = dayStartInTz(probe, LA)
    expect(localParts(start, LA).minutes).toBe(0)
    expect(localParts(start, LA).weekday).toBe(7) // Sunday Nov 1
  })

  test('addDaysInTz steps calendar days, not fixed 24h (25h fall-back day)', () => {
    const probe = new Date('2026-11-01T12:00:00Z')
    const next = addDaysInTz(probe, LA, 1)
    expect(localParts(next, LA).minutes).toBe(0)
    expect(localParts(next, LA).weekday).toBe(1) // Monday Nov 2
  })

  test('nextBatchAt stays on the correct local clock hour across DST', () => {
    const batch = { window: '02:30-06:00', gateLeadMin: 30 }
    // Nov 2 01:00 LA (the day after the fall-back transition) — the 02:30
    // wall clock today has not happened yet, so the batch lands today at 02:30.
    const when = new Date('2026-11-02T09:00:00Z') // 01:00 LA
    const next = nextBatchAt(when, batch, LA)
    expect(localParts(next, LA).minutes).toBe(150) // 02:30 wall clock
    expect(localParts(next, LA).weekday).toBe(1) // Monday Nov 2
  })

  test('localParts never throws on an invalid tz (falls back to system)', () => {
    const out = localParts(new Date('2026-08-17T00:00:00Z'), 'Not/ARealTz')
    expect(out.minutes).toBeGreaterThanOrEqual(0)
    expect(out.minutes).toBeLessThan(1440)
  })

  test('windowsInTz survives an invalid target tz', () => {
    const out = windowsInTz(OFFICIAL_PEAK_WINDOWS, 'Nope/Bad')
    expect(out.length).toBe(2)
  })
})

describe('pricing.float precision (Kimi review)', () => {
  test('costAtRow rounds to micro-yuan — no 0.1+0.2 class drift', () => {
    const row = { input: 0.1, inputCached: 0.1, output: 0.1 }
    let total = 0
    for (let i = 0; i < 1000; i++) {
      total += costAtRow({ input: 1000, output: 0, cacheRead: 0 }, row)
    }
    expect(Math.abs(total - 0.1)).toBeLessThan(1e-6)
  })

  test('costAtRow handles NaN-free zero usage', () => {
    expect(costAtRow({ input: 0, output: 0, cacheRead: 0 }, { input: 3, inputCached: 0.1, output: 9 })).toBe(0)
  })
})

describe('config.defaultConfig follows the official peak/valley windows', () => {
  test('a fresh install ships the official windows explicitly (weekdays only, weekends off-peak)', () => {
    const cfg = defaultConfig()
    expect(cfg.windows).toHaveLength(2)
    expect(cfg.windows.map((w) => w.level)).toEqual(['peak', 'peak'])
    expect(cfg.windows.every((w) => w.days !== undefined && w.days.length === 5
      && w.days.every((d) => d >= 1 && d <= 5))).toBe(true)
    expect(cfg.windows[0]?.days).toEqual([1, 2, 3, 4, 5])
  })

  test('the official windows leave the whole weekend off-peak', () => {
    const cfg = defaultConfig()
    const sat = new Date('2026-08-22T10:00:00+08:00') // Saturday 10:00 Beijing
    const sun = new Date('2026-08-23T10:00:00+08:00') // Sunday 10:00 Beijing
    expect(levelAt(sat, cfg.windows, 'Asia/Shanghai')?.level ?? 'off').toBe('off')
    expect(levelAt(sun, cfg.windows, 'Asia/Shanghai')?.level ?? 'off').toBe('off')
    const mon = new Date('2026-08-24T10:00:00+08:00') // Monday 10:00 Beijing — inside peak
    expect(levelAt(mon, cfg.windows, 'Asia/Shanghai')?.level).toBe('peak')
  })
})

describe('pricing official table covers all three deepseek models', () => {
  test('flash, pro and flash-vision-exp all have entries', () => {
    expect(Object.keys(OFFICIAL_PRICES).sort()).toEqual([
      'deepseek-v4-flash',
      'deepseek-v4-flash-vision-exp',
      'deepseek-v4-pro',
    ])
  })

  test('the vision model is priced identically to V4-Flash', () => {
    expect(OFFICIAL_PRICES['deepseek-v4-flash-vision-exp']).toEqual(OFFICIAL_PRICES['deepseek-v4-flash'])
    expect(hasPriceEntry('deepseek-v4-flash-vision-exp')).toBe(true)
  })

  test('a non-official model has no price entry', () => {
    expect(hasPriceEntry('mimo-v2.5-pro')).toBe(false)
    expect(hasPriceEntry('gpt-4o')).toBe(false)
  })
})
