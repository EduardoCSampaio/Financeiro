import { brl, iso, uid } from '../utils'

export default function Fixas({ S, setS, refDate, open }) {
  const mes = new Date(refDate.getFullYear(), refDate.getMonth(), 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const gerar = () => {
    const y = refDate.getFullYear(), m = refDate.getMonth(), last = new Date(y, m + 1, 0).getDate()
    const novos = []
    S.rec.forEach(r => {
      const date = iso(new Date(y, m, Math.min(r.day, last)))
      if (S.tx.some(t => t.rec === r.id && t.date.slice(0, 7) === date.slice(0, 7))) return
      novos.push({ id: uid(), rec: r.id, type: r.type, desc: r.desc, val: r.val, date, cat: r.cat, paid: false })
    })
    setS(s => ({ ...s, tx: [...s.tx, ...novos] }))
    alert(novos.length + ' lançamento(s) gerado(s).')
  }

  return (
    <div className="card">
      <div className="between" style={{ marginBottom: 8 }}>
        <h2>Fixas cadastradas</h2>
        <button className="b p" onClick={() => open('fixa')}>+ Nova fixa</button>
      </div>
      {S.rec.length === 0 && <small>Nenhuma ainda. Cadastre aluguel, assinaturas, salário...</small>}
      {S.rec.map(r => (
        <div className="row" key={r.id}>
          <span>{r.desc}<br /><small>dia {r.day} · {r.cat}</small></span>
          <span><b className={r.type}>{brl(r.val)}</b>{' '}
            <button className="xb" onClick={() => open('fixa', r)}>✎</button>
            <button className="xb" onClick={() => confirm('Excluir fixa? Lançamentos já gerados permanecem.') && setS(s => ({ ...s, rec: s.rec.filter(x => x.id !== r.id) }))}>✕</button></span>
        </div>
      ))}
      {S.rec.length > 0 && <p><button className="b p" onClick={gerar}>Gerar lançamentos de {mes}</button></p>}
    </div>
  )
}
