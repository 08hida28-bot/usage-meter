export type Meter = { line: string; warn: boolean }

declare module 'claude-code' {
  interface PluginState {
    'usage-meter': { meter: Meter | null }
  }
}
