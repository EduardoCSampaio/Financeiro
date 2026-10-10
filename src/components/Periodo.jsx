import { labelOf, moveRef, shiftCust, getRange, iso } from '../utils'

const NOMES = { dia: 'Dia', semana: 'Semana', mes: 'Mês', custom: 'Período' }

export default function Periodo({ per, setPer, refDate, setRef, cust, setCust, soMes }) {
  const go = n => (per === 'custom' ? setCust(shiftCust(cust, n)) : setRef(moveRef(per, refDate, n)))
  const pick = p => {
    if (p === 'custom' && !cust) { const [a, b] = getRange(per, refDate); setCust({ a, b }) }
    setPer(p)
  }
  const hoje = () => { setRef(new Date()); if (per === 'custom') setPer('mes') }
  const ir = e => e.target.value && setRef(new Date(e.target.value + 'T12:00'))

  return (
    <div className="pn">
      {!soMes && (
        <div className="seg">
          {Object.keys(NOMES).map(p => (
            <button key={p} className={'b' + (per === p ? ' p' : '')} onClick={() => pick(p)}>{NOMES[p]}</button>
          ))}
        </div>
      )}
      <div className="seg">
        <button className="b" onClick={() => go(-1)}>‹</button>
        <button className="b" onClick={hoje}>Hoje</button>
        <button className="b" onClick={() => go(1)}>›</button>
      </div>
      {per === 'custom' && !soMes ? (
        <div className="seg">
          <input type="date" value={cust.a} onChange={e => e.target.value && setCust({ a: e.target.value, b: e.target.value > cust.b ? e.target.value : cust.b })} />
          <input type="date" value={cust.b} onChange={e => e.target.value && setCust({ a: e.target.value < cust.a ? e.target.value : cust.a, b: e.target.value })} />
        </div>
      ) : (
        <input type="date" value={iso(refDate)} onChange={ir} title="Ir para uma data" />
      )}
      <b className="cap" style={{ width: '100%' }}>{labelOf(per, refDate, cust)}</b>
    </div>
  )
}
