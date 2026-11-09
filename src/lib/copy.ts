import { renderInline } from './manuscripts.mjs'
export function renderCopy(copy: Record<string, string>, key: string, params: Record<string, unknown> = {}): string {
  const raw = copy[key] ?? key
  return renderInline(raw.replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match)))
}
