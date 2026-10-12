import { atom, read, update } from 'claude-code'
import type { Register, SessionUsage } from 'claude-code'

import type { Meter } from '../types'

const meter = atom({ plugin: 'usage-meter', key: 'meter' } as const, null)

const LABEL: Record<string, string> = {
  five_hour: '5時間',
  seven_day: '週間',
  spend_limit: '支出上限',
}

const fmtReset = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return ` (${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}リセット)`
}

const format = (u: SessionUsage): Meter => {
  const parts: string[] = []
  let warn = false
  const c = u.context
  if (c.percent !== undefined) {
    parts.push(`コンテキスト ${c.percent}% (${Math.round((c.tokens ?? 0) / 1000)}k/${Math.round(c.window / 1000)}k)`)
    if (c.percent >= 80) warn = true
  }
  for (const r of u.rateLimits ?? []) {
    parts.push(`${LABEL[r.kind] ?? r.kind} ${r.percentUsed}%${fmtReset(r.resetsAt)}`)
    if (r.percentUsed >= 80) warn = true
  }
  if (u.cost) parts.push(`$${u.cost.usd.toFixed(2)}`)
  return { line: parts.length ? `使用量: ${parts.join(' ｜ ')}` : '使用量: 計測待ち', warn }
}

const WAITING: Meter = { line: '使用量: 計測待ち', warn: false }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    try {
      const m = format(await $.session.usage())
      await update($, meter, () => m)
      $.ui.status(m.line)
    } catch {
      $.ui.status(WAITING.line)
    }
    return r
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    try {
      const m = format(await $.session.usage())
      await update($, meter, () => m)
      $.ui.status(m.line)
    } catch {}
    return r
  })

  on('session.measure', async ($, e, next) => {
    const m = format({ startedAt: 0, context: e.context, rateLimits: e.rateLimits, cost: e.cost })
    await update($, meter, () => m)
    $.ui.status(m.line)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const m = (await read($, meter)) ?? WAITING
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box>
        <Text dimColor={!m.warn} color={m.warn ? 'yellow' : undefined}>{m.line}</Text>
      </Box>
    )
  })
}
