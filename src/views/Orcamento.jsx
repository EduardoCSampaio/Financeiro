import { CO } from '../utils'

export default function Orcamento({ S, setS }) {
  return (
    <div className="card">
      <h2>Limite mensal por categoria</h2>
      <small>Deixe vazio para sem limite. Aparece no Resumo mensal.</small>
      {CO.map(c => (
        <div className="row" key={c}>
          <span>{c}</span>
          <input type="number" min="0" step="10" style={{ width: 130, flex: 'none' }} value={S.bud[c] || ''}
            onChange={e => setS(s => ({ ...s, bud: { ...s.bud, [c]: parseFloat(e.target.value) || 0 } }))} />
        </div>
      ))}
    </div>
  )
}
