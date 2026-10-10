import { useState } from 'react'
import { useStore } from './useStore'
import { getRange, uid, addMonths } from './utils'
import Periodo from './components/Periodo'
import Resumo from './views/Resumo'
import Analise from './views/Analise'
import Lancamentos from './views/Lancamentos'
import Fixas from './views/Fixas'
import Orcamento from './views/Orcamento'
import Metas from './views/Metas'
import Dados from './views/Dados'
import { TxModal, FixaModal, MetaModal, AporteModal } from './modals'

const TABS = { resumo: 'Resumo', analise: 'Análise', lanc: 'Lançamentos', fixas: 'Fixas', orc: 'Orçamento', metas: 'Metas', dados: 'Dados' }
const upsert = (arr, d, extra) => (d.id ? arr.map(x => (x.id === d.id ? { ...x, ...d } : x)) : [...arr, { id: uid(), ...extra, ...d }])

export default function App() {
  const [S, setS] = useStore()
  const [view, setView] = useState('resumo')
  const [per, setPer] = useState('mes')
  const [refDate, setRef] = useState(new Date())
  const [cust, setCust] = useState(null)
  const [modal, setModal] = useState(null)
  const open = (kind, data) => setModal({ kind, data })
  const close = () => setModal(null)

  const range = getRange(per, refDate, cust)
  const list = S.tx.filter(t => t.date >= range[0] && t.date <= range[1]).sort((x, y) => y.date.localeCompare(x.date))
  const comPeriodo = ['resumo', 'lanc', 'analise'].includes(view)

  const saveTx = d => {
    setS(s => {
      const campos = { type: d.type, desc: d.desc, val: d.val, date: d.date, cat: d.cat, paid: d.paid }
      if (d.id) return { ...s, tx: s.tx.map(t => (t.id === d.id ? { ...t, ...campos } : t)) }
      const n = d.n || 1
      if (n <= 1) return { ...s, tx: [...s.tx, { id: uid(), ...campos }] }
      const grp = uid(), cada = Math.floor((d.val / n) * 100) / 100, novos = []
      for (let i = 0; i < n; i++) novos.push({
        id: uid(), grp, ...campos, desc: `${d.desc} (${i + 1}/${n})`,
        val: i === n - 1 ? +(d.val - cada * (n - 1)).toFixed(2) : cada,
        date: addMonths(d.date, i), paid: i === 0 ? d.paid : false,
      })
      return { ...s, tx: [...s.tx, ...novos] }
    })
    close()
  }

  const m = modal
  return (
    <div className="w">
      <header className="hd">
        <img src="/logo.svg" alt="Logo" />
        <h1>Meu Financeiro</h1>
        <span className="sp" />
        <button className="b gi" onClick={() => open('in')}>+ Entrada</button>
        <button className="b go" onClick={() => open('out')}>+ Saída</button>
      </header>
      <nav>
        {Object.entries(TABS).map(([k, v]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{v}</button>
        ))}
      </nav>
      {comPeriodo && <Periodo per={view === 'analise' ? 'mes' : per} setPer={setPer} refDate={refDate} setRef={setRef} cust={cust} setCust={setCust} soMes={view === 'analise'} />}
      {view === 'resumo' && <Resumo S={S} per={per} range={range} list={list} />}
      {view === 'analise' && <Analise S={S} refDate={refDate} />}
      {view === 'lanc' && <Lancamentos setS={setS} list={list} open={open} />}
      {view === 'fixas' && <Fixas S={S} setS={setS} refDate={refDate} open={open} />}
      {view === 'orc' && <Orcamento S={S} setS={setS} />}
      {view === 'metas' && <Metas S={S} setS={setS} open={open} />}
      {view === 'dados' && <Dados S={S} setS={setS} />}

      {m && (m.kind === 'in' || m.kind === 'out') && <TxModal tipo={m.kind} init={m.data} onSave={saveTx} onClose={close} />}
      {m?.kind === 'fixa' && <FixaModal init={m.data} onClose={close} onSave={d => { setS(s => ({ ...s, rec: upsert(s.rec, d) })); close() }} />}
      {m?.kind === 'meta' && <MetaModal init={m.data} onClose={close} onSave={d => { setS(s => ({ ...s, goals: upsert(s.goals, d, { saved: 0 }) })); close() }} />}
      {m?.kind === 'aporte' && <AporteModal meta={m.data} onClose={close} onSave={(id, v) => { setS(s => ({ ...s, goals: s.goals.map(g => (g.id === id ? { ...g, saved: Math.max(0, g.saved + v) } : g)) })); close() }} />}
    </div>
  )
}
