export const CO = ['Moradia','Alimentação','Transporte','Saúde','Lazer','Educação','Contas','Cartão','Outros']
export const CI = ['Salário','Extra','Investimentos','Outros']

export const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
export const brl = n => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fd = s => s.split('-').reverse().join('/').slice(0, 5)
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const sum = a => a.reduce((x, t) => x + t.val, 0)
const dt = s => new Date(s + 'T12:00')

export function getRange(per, ref, cust) {
  if (per === 'custom' && cust) return [cust.a, cust.b]
  if (per === 'dia') return [iso(ref), iso(ref)]
  if (per === 'semana') {
    const s = new Date(ref); s.setDate(ref.getDate() - ((ref.getDay() + 6) % 7))
    const e = new Date(s); e.setDate(s.getDate() + 6)
    return [iso(s), iso(e)]
  }
  return [iso(new Date(ref.getFullYear(), ref.getMonth(), 1)), iso(new Date(ref.getFullYear(), ref.getMonth() + 1, 0))]
}

export function moveRef(per, ref, n) {
  const d = new Date(ref)
  if (per === 'dia') d.setDate(d.getDate() + n)
  else if (per === 'semana') d.setDate(d.getDate() + 7 * n)
  else return new Date(d.getFullYear(), d.getMonth() + n, 1)
  return d
}

export function shiftCust(c, n) {
  const a = dt(c.a), b = dt(c.b), span = Math.round((b - a) / 864e5) + 1
  a.setDate(a.getDate() + n * span); b.setDate(b.getDate() + n * span)
  return { a: iso(a), b: iso(b) }
}

export function addMonths(s, n) {
  const [y, m, d] = s.split('-').map(Number)
  const last = new Date(y, m - 1 + n + 1, 0).getDate()
  return iso(new Date(y, m - 1 + n, Math.min(d, last)))
}

export function labelOf(per, ref, cust) {
  const [a, b] = getRange(per, ref, cust)
  const d = dt(a)
  if (per === 'custom') return `${d.toLocaleDateString('pt-BR')} a ${dt(b).toLocaleDateString('pt-BR')}`
  if (per === 'dia') return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (per === 'semana') return `${fd(a)} a ${fd(b)}`
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
