import { analisar } from '../insights'
import { brl, fd } from '../utils'

const pct = n => (n * 100).toFixed(0) + '%'

export default function Analise({ S, refDate }) {
  const a = analisar(S, refDate)
  const mxT = Math.max(1, ...a.trend.flatMap(t => [t.in, t.out]))
  const mxS = Math.max(1, ...a.semana.map(s => s.v))

  if (a.vazio) return <div className="card"><small>Sem lançamentos neste mês. Cadastre alguns para ver a análise.</small></div>

  return (
    <>
      <div className="g">
        <div className="card k"><small>Sobra do mês</small><b className={a.ein - a.eout >= 0 ? 'in' : 'out'}>{brl(a.ein - a.eout)}</b>{a.rate !== null && <small>{pct(a.rate)} da renda</small>}</div>
        <div className="card k"><small>Gasto médio por dia</small><b>{brl(a.mediaDia)}</b></div>
        <div className="card k"><small>{a.atual ? 'Projeção do mês (estimativa)' : 'Total gasto'}</small><b>{brl(a.proj)}</b></div>
        <div className="card k"><small>vs. mês anterior</small><b className={a.vsPrev > 0 ? 'out' : 'in'}>{a.vsPrev === null ? '—' : (a.vsPrev > 0 ? '+' : '') + pct(a.vsPrev)}</b></div>
      </div>

      <div className="card">
        <h2>Onde estão os furos</h2>
        {a.al.length === 0 && <small>Nenhum alerta neste mês. Bom sinal!</small>}
        {a.al.map((x, i) => (
          <div key={i} className={'al ' + x.n}><b>{x.t}</b><small>{x.x}</small></div>
        ))}
      </div>

      <div className="card">
        <h2>Últimos 6 meses</h2>
        <div className="ch" style={{ height: 130 }}>
          {a.trend.map(t => (
            <div key={t.k} style={{ minWidth: 36 }} title={`${t.label}: +${brl(t.in)} / -${brl(t.out)}`}>
              <i style={{ height: (t.in / mxT) * 40 + '%', background: 'var(--in)' }} />
              <i style={{ height: (t.out / mxT) * 40 + '%', background: 'var(--out)' }} />
              <span className="lbl">{t.label}</span>
            </div>
          ))}
        </div>
        <small>Verde: entradas · Vermelho: saídas</small>
      </div>

      <div className="card">
        <h2>Categorias: este mês vs. anterior</h2>
        {a.cats.map(c => (
          <div className="row" key={c.c}>
            <span>{c.c}</span>
            <span>{brl(c.cur)} <small>(ant. {brl(c.prev)})</small> <b className={c.delta > 0 ? 'out' : 'in'}>{c.delta > 0 ? '▲' : c.delta < 0 ? '▼' : ''}</b></span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Gasto por dia da semana</h2>
        <div className="ch" style={{ height: 100 }}>
          {a.semana.map(s => (
            <div key={s.n} title={brl(s.v)}>
              <i style={{ height: (s.v / mxS) * 80 + '%', background: 'var(--ac)' }} />
              <span className="lbl">{s.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Maiores gastos do mês</h2>
        {a.top.map(t => (
          <div className="row" key={t.id}>
            <span>{t.desc}<br /><small>{fd(t.date)} · {t.cat}</small></span>
            <b className="out">{brl(t.val)}</b>
          </div>
        ))}
      </div>
    </>
  )
}
