import { brl, fd, iso, sum } from '../utils'

export default function Resumo({ S, per, range, list }) {
  const I = list.filter(t => t.type === 'in')
  const O = list.filter(t => t.type === 'out')
  const ein = sum(I), eout = sum(O), pend = sum(O.filter(t => !t.paid))
  const caixa = (S.saldo0 || 0) + sum(S.tx.filter(t => t.type === 'in' && t.paid)) - sum(S.tx.filter(t => t.type === 'out' && t.paid))

  const [a, b] = range
  const days = []
  for (let d = new Date(a + 'T12:00'); iso(d) <= b; d.setDate(d.getDate() + 1)) days.push(iso(d))
  const vals = days.map(d => [sum(I.filter(t => t.date === d)), sum(O.filter(t => t.date === d))])
  const mx = Math.max(1, ...vals.flat())

  const by = {}
  O.forEach(t => (by[t.cat] = (by[t.cat] || 0) + t.val))
  const cats = Object.entries(by).sort((x, y) => y[1] - x[1])
  const prox = S.tx.filter(t => t.type === 'out' && !t.paid).sort((x, y) => x.date.localeCompare(y.date)).slice(0, 5)

  return (
    <>
      <div className="g">
        <div className="card k"><small>Entradas</small><b className="in">{brl(ein)}</b></div>
        <div className="card k"><small>Saídas</small><b className="out">{brl(eout)}</b></div>
        <div className="card k"><small>Saldo do período</small><b>{brl(ein - eout)}</b></div>
        <div className="card k"><small>A pagar</small><b>{brl(pend)}</b></div>
        <div className="card k"><small>Saldo em caixa (c/ saldo inicial)</small><b>{brl(caixa)}</b></div>
      </div>

      {per !== 'dia' && days.length > 1 && days.length <= 93 && (
        <div className="card">
          <h2>Movimento por dia</h2>
          <div className="ch">
            {days.map((d, i) => (
              <div key={d} title={`${fd(d)}: +${brl(vals[i][0])} / -${brl(vals[i][1])}`}>
                <i style={{ height: (vals[i][0] / mx) * 50 + '%', background: 'var(--in)' }} />
                <i style={{ height: (vals[i][1] / mx) * 50 + '%', background: 'var(--out)' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Gastos por categoria</h2>
        {cats.length === 0 && <small>Sem gastos neste período.</small>}
        {cats.map(([c, v]) => {
          const lim = per === 'mes' ? S.bud[c] : 0
          const pc = lim ? Math.min(100, (v / lim) * 100) : eout ? (v / eout) * 100 : 0
          return (
            <div key={c} style={{ marginBottom: 6 }}>
              <div className="between"><span>{c}</span><span>{brl(v)}{lim ? <small> / {brl(lim)}</small> : null}</span></div>
              <div className={'bar' + (lim && v > lim ? ' over' : '')}><i style={{ width: pc + '%' }} /></div>
            </div>
          )
        })}
      </div>

      {prox.length > 0 && (
        <div className="card">
          <h2>Próximas contas a pagar</h2>
          {prox.map(t => (
            <div className="row" key={t.id}>
              <span>{t.desc}<br /><small>{fd(t.date)} · {t.cat}</small></span>
              <b className="out">{brl(t.val)}</b>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
