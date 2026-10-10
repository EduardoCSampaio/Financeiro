import { useState } from 'react'
import { CO, CI, brl, fd } from '../utils'

export default function Lancamentos({ setS, list, open }) {
  const [q, setQ] = useState('')
  const [tp, setTp] = useState('')
  const [cat, setCat] = useState('')
  const [st, setSt] = useState('')

  const L = list.filter(t =>
    (!q || t.desc.toLowerCase().includes(q.toLowerCase())) && (!tp || t.type === tp) &&
    (!cat || t.cat === cat) && (!st || (st === 'pend' ? !t.paid : t.paid)))
  const ent = L.filter(t => t.type === 'in').reduce((a, t) => a + t.val, 0)
  const sai = L.filter(t => t.type === 'out').reduce((a, t) => a + t.val, 0)

  const toggle = id => setS(s => ({ ...s, tx: s.tx.map(t => (t.id === id ? { ...t, paid: !t.paid } : t)) }))
  const del = t => {
    if (!confirm('Excluir este lançamento?')) return
    const todas = t.grp && confirm('Excluir também as outras parcelas desse parcelamento?')
    setS(s => ({ ...s, tx: s.tx.filter(x => (todas ? x.grp !== t.grp : x.id !== t.id)) }))
  }

  return (
    <div className="card">
      <h2>Lançamentos ({L.length})</h2>
      <div className="f" style={{ marginBottom: 10 }}>
        <input placeholder="Buscar descrição" value={q} onChange={e => setQ(e.target.value)} />
        <select value={tp} onChange={e => setTp(e.target.value)}><option value="">Todos os tipos</option><option value="in">Entradas</option><option value="out">Saídas</option></select>
        <select value={cat} onChange={e => setCat(e.target.value)}><option value="">Todas categorias</option>{[...new Set([...CO, ...CI])].map(c => <option key={c}>{c}</option>)}</select>
        <select value={st} onChange={e => setSt(e.target.value)}><option value="">Qualquer status</option><option value="pend">Pendentes</option><option value="ok">Pagos/recebidos</option></select>
      </div>
      {L.length > 0 && <p><small>Filtrado: <span className="in">+{brl(ent)}</span> · <span className="out">-{brl(sai)}</span></small></p>}
      {L.length === 0 && <small>Nada encontrado neste período.</small>}
      {L.map(t => (
        <div className="row" key={t.id}>
          <span>
            {t.desc}<br />
            <small>{fd(t.date)} · {t.cat} · <a href="#" className="lnk" onClick={e => { e.preventDefault(); toggle(t.id) }}>
              {t.paid ? (t.type === 'in' ? 'recebido' : 'pago') : 'pendente'}</a></small>
          </span>
          <span>
            <b className={t.type}>{t.type === 'in' ? '+' : '-'}{brl(t.val)}</b>{' '}
            <button className="xb" title="Editar" onClick={() => open(t.type, t)}>✎</button>
            <button className="xb" title="Excluir" onClick={() => del(t)}>✕</button>
          </span>
        </div>
      ))}
    </div>
  )
}
