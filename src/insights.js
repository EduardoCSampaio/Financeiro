import { iso, sum, brl, CO } from './utils'

const SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const norm = s => s.trim().toLowerCase()

export function analisar(S, ref) {
  const y = ref.getFullYear(), m = ref.getMonth()
  const key = off => iso(new Date(y, m + off, 1)).slice(0, 7)
  const doMes = (k, type) => S.tx.filter(t => t.date.slice(0, 7) === k && t.type === type)
  const k0 = key(0), k1 = key(-1)

  const I = doMes(k0, 'in'), O = doMes(k0, 'out'), Op = doMes(k1, 'out')
  const ein = sum(I), eout = sum(O), eprev = sum(Op)

  const hoje = new Date(), hojeIso = iso(hoje)
  const atual = hojeIso.slice(0, 7) === k0
  const diasMes = new Date(y, m + 1, 0).getDate()
  const decorridos = atual ? hoje.getDate() : diasMes
  const mediaDia = eout / decorridos
  const proj = atual ? mediaDia * diasMes : eout
  const rate = ein > 0 ? (ein - eout) / ein : null
  const vsPrev = eprev > 0 ? (eout - eprev) / eprev : null

  // categorias: mês atual vs anterior
  const agr = l => l.reduce((o, t) => ((o[t.cat] = (o[t.cat] || 0) + t.val), o), {})
  const c0 = agr(O), c1 = agr(Op)
  const cats = [...new Set([...Object.keys(c0), ...Object.keys(c1)])]
    .map(c => ({ c, cur: c0[c] || 0, prev: c1[c] || 0, delta: (c0[c] || 0) - (c1[c] || 0) }))
    .sort((a, b) => b.cur - a.cur)

  // tendência 6 meses
  const trend = []
  for (let i = -5; i <= 0; i++) {
    const k = key(i), d = new Date(y, m + i, 1)
    trend.push({ k, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), in: sum(doMes(k, 'in')), out: sum(doMes(k, 'out')) })
  }

  // dia da semana
  const semana = SEM.map((n, i) => ({ n, v: sum(O.filter(t => new Date(t.date + 'T12:00').getDay() === i)) }))
  const top = O.slice().sort((a, b) => b.val - a.val).slice(0, 5)

  // alertas
  const al = []
  const add = (n, t, x) => al.push({ n, t, x })

  const atrasadas = S.tx.filter(t => t.type === 'out' && !t.paid && t.date < hojeIso)
  if (atrasadas.length) add('alta', `${atrasadas.length} conta(s) vencida(s) sem pagamento`, `Somam ${brl(sum(atrasadas))}. Vá em Lançamentos e marque como paga ou ajuste a data.`)

  if (ein > 0 && eout > ein) add('alta', 'Você gastou mais do que recebeu', `Saídas de ${brl(eout)} contra entradas de ${brl(ein)}: déficit de ${brl(eout - ein)}.`)
  else if (atual && ein > 0 && proj > ein) add('media', 'Ritmo de gastos acima da receita', `Mantendo a média de ${brl(mediaDia)} por dia, o mês fecha perto de ${brl(proj)}, acima das entradas de ${brl(ein)}.`)

  if (rate !== null && rate >= 0 && rate < 0.1) add('media', 'Pouca sobra no mês', `Você guardou ${(rate * 100).toFixed(0)}% da renda. Uma meta comum é entre 10% e 20%.`)

  CO.forEach(c => {
    const lim = S.bud[c]
    if (!(lim > 0)) return
    const p = (c0[c] || 0) / lim
    if (p >= 1) add('alta', `Orçamento de ${c} estourado`, `${brl(c0[c])} gastos de um limite de ${brl(lim)} (${(p * 100).toFixed(0)}%).`)
    else if (p >= 0.8) add('media', `${c} perto do limite`, `Já usou ${(p * 100).toFixed(0)}% do orçamento (${brl(c0[c])} de ${brl(lim)}).`)
  })

  cats.forEach(({ c, cur, prev, delta }) => {
    if (prev > 0 && cur > prev * 1.2 && delta >= 50) add('media', `${c} subiu ${(((cur - prev) / prev) * 100).toFixed(0)}%`, `${brl(cur)} neste mês contra ${brl(prev)} no anterior (+${brl(delta)}).`)
  })

  if (eout > 0 && (c0['Outros'] || 0) >= 50 && c0['Outros'] / eout > 0.15) add('info', 'Muito gasto em "Outros"', `${((c0['Outros'] / eout) * 100).toFixed(0)}% das saídas (${brl(c0['Outros'])}) estão sem categoria clara, o que esconde onde o dinheiro vai.`)

  const peq = O.filter(t => t.val <= 30)
  if (peq.length >= 5 && eout > 0 && sum(peq) >= eout * 0.05) add('media', 'Gastos pequenos somando bastante', `${peq.length} compras de até R$ 30 somaram ${brl(sum(peq))} (${((sum(peq) / eout) * 100).toFixed(0)}% das saídas). Nesse ritmo, são cerca de ${brl(sum(peq) * 12)} por ano.`)

  const dup = {}
  O.forEach(t => { const k = `${t.date}|${t.val}|${norm(t.desc)}`; dup[k] = (dup[k] || 0) + 1 })
  const nd = Object.values(dup).filter(n => n > 1).length
  if (nd) add('media', 'Possíveis lançamentos duplicados', `${nd} grupo(s) com mesma data, valor e descrição. Confira em Lançamentos.`)

  const fixosCad = new Set(S.rec.map(r => norm(r.desc)))
  const meses = {}
  ;[0, -1, -2].forEach(i => doMes(key(i), 'out').filter(t => !t.rec).forEach(t => {
    const n = norm(t.desc); (meses[n] = meses[n] || new Set()).add(key(i))
  }))
  Object.entries(meses).filter(([n, s]) => s.size >= 2 && !fixosCad.has(n)).slice(0, 3)
    .forEach(([n]) => add('info', `"${n}" parece uma conta fixa`, 'Apareceu em mais de um mês e não está em Fixas. Cadastrar ajuda a prever o mês.'))

  const fixoOut = sum(O.filter(t => t.rec))
  if (ein > 0 && fixoOut / ein > 0.5) add('media', 'Contas fixas pesam na renda', `As fixas geradas somam ${brl(fixoOut)}, ${((fixoOut / ein) * 100).toFixed(0)}% das entradas do mês.`)

  if (O.length >= 8) {
    const mx = semana.reduce((a, b) => (b.v > a.v ? b : a))
    add('info', `${mx.n} é o dia em que você mais gasta`, `${brl(mx.v)} do mês (${((mx.v / eout) * 100).toFixed(0)}%) foram em ${mx.n}.`)
  }
  if (top[0] && eout > 0 && top[0].val / eout > 0.25 && O.length > 3) add('info', 'Um gasto pesa muito no mês', `"${top[0].desc}" sozinho é ${((top[0].val / eout) * 100).toFixed(0)}% das saídas (${brl(top[0].val)}).`)

  const ordem = { alta: 0, media: 1, info: 2 }
  al.sort((a, b) => ordem[a.n] - ordem[b.n])

  return { ein, eout, rate, mediaDia, proj, atual, vsPrev, cats, trend, semana, top, al, vazio: I.length + O.length === 0 }
}
