import { useState } from 'react'
import { CO, CI, brl, fd, iso, uid } from '../utils'

export default function Lancamentos({ setS, list }) {
  const [f, setF] = useState({ type: 'out', desc: '', val: '', date: iso(new Date()), cat: CO[0], paid: true })
  const set = (k, v) => setF(p => ({ ...p, [k]: v, ...(k === 'type' ? { cat: (v === 'in' ? CI : CO)[0] } : {}) }))

  const add = () => {
    const val = parseFloat(f.val)
    if (!f.desc.trim() || !(val > 0) || !f.date) return alert('Preencha descrição, valor e data.')
    setS(s => ({ ...s, tx: [...s.tx, { id: uid(), ...f, desc: f.desc.trim(), val }] }))
    setF(p => ({ ...p, desc: '', val: '' }))
  }
  const toggle = id => setS(s => ({ ...s, tx: s.tx.map(t => (t.id === id ? { ...t, paid: !t.paid } : t)) }))
  const del = id => confirm('Excluir?') && setS(s => ({ ...s, tx: s.tx.filter(t => t.id !== id) }))

  return (
    <>
      <div className="card">
        <h2>Novo lançamento</h2>
        <div className="f">
          <select value={f.type} onChange={e => set('type', e.target.value)}>
            <option value="out">Saída</option><option value="in">Entrada</option>
          </select>
          <input placeholder="Descrição" value={f.desc} onChange={e => set('desc', e.target.value)} />
          <input type="number" step="0.01" min="0" placeholder="Valor" value={f.val} onChange={e => set('val', e.target.value)} />
          <input type="date" value={f.date} onChange={e => set('date', e.target.value)} />
          <select value={f.cat} onChange={e => set('cat', e.target.value)}>
            {(f.type === 'in' ? CI : CO).map(c => <option key={c}>{c}</option>)}
          </select>
          <label style={{ flex: '0 0 auto' }}>
            <input type="checkbox" checked={f.paid} onChange={e => set('paid', e.target.checked)} /> Pago/recebido
          </label>
          <button className="b p" onClick={add}>Adicionar</button>
        </div>
      </div>

      <div className="card">
        <h2>Lançamentos ({list.length})</h2>
        {list.length === 0 && <small>Nada neste período.</small>}
        {list.map(t => (
          <div className="row" key={t.id}>
            <span>
              {t.desc}<br />
              <small>{fd(t.date)} · {t.cat} · <a href="#" className="lnk" onClick={e => { e.preventDefault(); toggle(t.id) }}>
                {t.paid ? (t.type === 'in' ? 'recebido' : 'pago') : 'pendente'}</a></small>
            </span>
            <span>
              <b className={t.type}>{t.type === 'in' ? '+' : '-'}{brl(t.val)}</b>{' '}
              <button className="xb" onClick={() => del(t.id)}>✕</button>
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
