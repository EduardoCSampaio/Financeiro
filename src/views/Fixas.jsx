import { useState } from 'react'
import { CO, CI, brl, iso, uid } from '../utils'

export default function Fixas({ S, setS, refDate }) {
  const [f, setF] = useState({ type: 'out', desc: '', val: '', day: '', cat: CO[0] })
  const set = (k, v) => setF(p => ({ ...p, [k]: v, ...(k === 'type' ? { cat: (v === 'in' ? CI : CO)[0] } : {}) }))
  const mes = new Date(refDate.getFullYear(), refDate.getMonth(), 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const add = () => {
    const val = parseFloat(f.val), day = parseInt(f.day)
    if (!f.desc.trim() || !(val > 0) || !(day >= 1 && day <= 31)) return alert('Preencha descrição, valor e dia (1–31).')
    setS(s => ({ ...s, rec: [...s.rec, { id: uid(), ...f, desc: f.desc.trim(), val, day }] }))
    setF(p => ({ ...p, desc: '', val: '', day: '' }))
  }

  const gerar = () => {
    const y = refDate.getFullYear(), m = refDate.getMonth(), last = new Date(y, m + 1, 0).getDate()
    let novos = []
    S.rec.forEach(r => {
      const date = iso(new Date(y, m, Math.min(r.day, last)))
      if (S.tx.some(t => t.rec === r.id && t.date.slice(0, 7) === date.slice(0, 7))) return
      novos.push({ id: uid(), rec: r.id, type: r.type, desc: r.desc, val: r.val, date, cat: r.cat, paid: false })
    })
    setS(s => ({ ...s, tx: [...s.tx, ...novos] }))
    alert(novos.length + ' lançamento(s) gerado(s).')
  }

  return (
    <>
      <div className="card">
        <h2>Nova conta/receita fixa mensal</h2>
        <div className="f">
          <select value={f.type} onChange={e => set('type', e.target.value)}>
            <option value="out">Saída</option><option value="in">Entrada</option>
          </select>
          <input placeholder="Descrição" value={f.desc} onChange={e => set('desc', e.target.value)} />
          <input type="number" step="0.01" placeholder="Valor" value={f.val} onChange={e => set('val', e.target.value)} />
          <input type="number" min="1" max="31" placeholder="Dia do mês" value={f.day} onChange={e => set('day', e.target.value)} />
          <select value={f.cat} onChange={e => set('cat', e.target.value)}>
            {(f.type === 'in' ? CI : CO).map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="b p" onClick={add}>Adicionar</button>
        </div>
      </div>
      <div className="card">
        <h2>Fixas cadastradas</h2>
        {S.rec.length === 0 && <small>Nenhuma ainda.</small>}
        {S.rec.map(r => (
          <div className="row" key={r.id}>
            <span>{r.desc}<br /><small>dia {r.day} · {r.cat}</small></span>
            <span><b className={r.type}>{brl(r.val)}</b>{' '}
              <button className="xb" onClick={() => setS(s => ({ ...s, rec: s.rec.filter(x => x.id !== r.id) }))}>✕</button></span>
          </div>
        ))}
        {S.rec.length > 0 && <p><button className="b p" onClick={gerar}>Gerar lançamentos de {mes}</button></p>}
      </div>
    </>
  )
}
