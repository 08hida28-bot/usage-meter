import { test, expect } from 'claude-code/testing'

test('計測イベントの使用量がプロンプト上に表示される', async ($, on) => {
  on('session.measure', ($, e) => ({ changed: e.changed }))
  await $.session.measure({
    context: { tokens: 50000, window: 200000, percent: 25 },
    rateLimits: [{ kind: 'five_hour', percentUsed: 42 }, { kind: 'seven_day', percentUsed: 85 }],
    cost: { usd: 1.234 },
    changed: ['context'],
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'usage-meter', surface, component: 'AbovePrompt', props: { hasSurvey: false } })
    const t = await ui.find({ type: 'Text', text: /5時間 42%/ })
    expect(t?.text).toContain('コンテキスト 25% (50k/200k)')
    expect(t?.text).toContain('週間 85%')
    expect(t?.text).toContain('$1.23')
    await ui.unmount()
  }
})

test('計測前・アンケート表示中でも常に表示される', async $ => {
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'usage-meter', surface, component: 'AbovePrompt', props: { hasSurvey: true } })
    expect(await ui.find({ type: 'Text', text: /使用量/ })).toBeDefined()
    await ui.unmount()
  }
})
