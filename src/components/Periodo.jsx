import { labelOf, moveRef } from '../utils'

export default function Periodo({ per, setPer, refDate, setRef }) {
  return (
    <div className="pn">
      <div className="seg">
        {['dia', 'semana', 'mes'].map(p => (
          <button key={p} className={'b' + (per === p ? ' p' : '')} onClick={() => setPer(p)}>
            {p === 'mes' ? 'Mês' : p[0].toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div className="seg">
        <button className="b" onClick={() => setRef(moveRef(per, refDate, -1))}>‹</button>
        <button className="b" onClick={() => setRef(new Date())}>Hoje</button>
        <button className="b" onClick={() => setRef(moveRef(per, refDate, 1))}>›</button>
      </div>
      <b className="cap" style={{ width: '100%' }}>{labelOf(per, refDate)}</b>
    </div>
  )
}
