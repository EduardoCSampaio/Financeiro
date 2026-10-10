import { brl } from '../utils'

export default function Metas({ S, setS, open }) {
  const del = id => confirm('Excluir meta?') && setS(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }))
  return (
    <div className="card">
      <div className="between" style={{ marginBottom: 8 }}>
        <h2>Minhas metas</h2>
        <button className="b p" onClick={() => open('meta')}>+ Nova meta</button>
      </div>
      {S.goals.length === 0 && <small>Nenhuma meta.</small>}
      {S.goals.map(g => {
        const p = Math.min(100, (g.saved / g.target) * 100)
        const falta = Math.max(0, g.target - g.saved)
        const meses = g.prazo ? Math.max(1, Math.ceil((new Date(g.prazo + 'T12:00') - new Date()) / (30.44 * 864e5))) : 0
        return (
          <div key={g.id} style={{ marginBottom: 16 }}>
            <div className="between"><b>{g.name}</b><span>{brl(g.saved)} / {brl(g.target)}</span></div>
            <div className="bar"><i style={{ width: p + '%' }} /></div>
            <small>{p.toFixed(0)}%{g.prazo && falta > 0 ? ` · prazo ${new Date(g.prazo + 'T12:00').toLocaleDateString('pt-BR')} · guardar ~${brl(falta / meses)}/mês` : ''}{falta === 0 ? ' · meta atingida 🎉' : ''}</small>
            <div style={{ marginTop: 6 }}>
              <button className="b" onClick={() => open('aporte', g)}>Movimentar</button>{' '}
              <button className="xb" onClick={() => open('meta', g)}>✎</button>
              <button className="xb" onClick={() => del(g.id)}>✕</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
