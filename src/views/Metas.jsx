import { useState } from 'react'
import { brl, uid } from '../utils'

export default function Metas({ S, setS }) {
  const [n, setN] = useState('')
  const [t, setT] = useState('')

  const add = () => {
    const alvo = parseFloat(t)
    if (!n.trim() || !(alvo > 0)) return alert('Preencha nome e valor alvo.')
    setS(s => ({ ...s, goals: [...s.goals, { id: uid(), name: n.trim(), target: alvo, saved: 0 }] }))
    setN(''); setT('')
  }
  const aporte = id => {
    const v = parseFloat((prompt('Valor do aporte (negativo para retirar):') || '').replace(',', '.'))
    if (isNaN(v)) return
    setS(s => ({ ...s, goals: s.goals.map(g => (g.id === id ? { ...g, saved: Math.max(0, g.saved + v) } : g)) }))
  }
  const del = id => confirm('Excluir meta?') && setS(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }))

  return (
    <>
      <div className="card">
        <h2>Nova meta</h2>
        <div className="f">
          <input placeholder="Ex.: Reserva de emergência" value={n} onChange={e => setN(e.target.value)} />
          <input type="number" min="1" placeholder="Valor alvo" value={t} onChange={e => setT(e.target.value)} />
          <button className="b p" onClick={add}>Criar</button>
        </div>
      </div>
      <div className="card">
        <h2>Minhas metas</h2>
        {S.goals.length === 0 && <small>Nenhuma meta.</small>}
        {S.goals.map(g => {
          const p = Math.min(100, (g.saved / g.target) * 100)
          return (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div className="between"><b>{g.name}</b><span>{brl(g.saved)} / {brl(g.target)}</span></div>
              <div className="bar"><i style={{ width: p + '%' }} /></div>
              <button className="b" onClick={() => aporte(g.id)}>+ Aporte</button>{' '}
              <button className="xb" onClick={() => del(g.id)}>✕</button> <small>{p.toFixed(0)}%</small>
            </div>
          )
        })}
      </div>
    </>
  )
}
