import { useState } from 'react'
import { useStore } from './useStore'
import { getRange } from './utils'
import Periodo from './components/Periodo'
import Resumo from './views/Resumo'
import Lancamentos from './views/Lancamentos'
import Fixas from './views/Fixas'
import Orcamento from './views/Orcamento'
import Metas from './views/Metas'
import Dados from './views/Dados'

const TABS = { resumo: 'Resumo', lanc: 'Lançamentos', fixas: 'Fixas', orc: 'Orçamento', metas: 'Metas', dados: 'Dados' }

export default function App() {
  const [S, setS] = useStore()
  const [view, setView] = useState('resumo')
  const [per, setPer] = useState('mes')
  const [refDate, setRef] = useState(new Date())

  const [a, b] = getRange(per, refDate)
  const list = S.tx.filter(t => t.date >= a && t.date <= b).sort((x, y) => y.date.localeCompare(x.date))
  const comPeriodo = view === 'resumo' || view === 'lanc'

  return (
    <div className="w">
      <header className="hd">
        <img src="/logo.svg" alt="Logo" />
        <h1>Meu Financeiro</h1>
      </header>
      <nav>
        {Object.entries(TABS).map(([k, v]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{v}</button>
        ))}
      </nav>
      {comPeriodo && <Periodo per={per} setPer={setPer} refDate={refDate} setRef={setRef} />}
      {view === 'resumo' && <Resumo S={S} per={per} refDate={refDate} list={list} />}
      {view === 'lanc' && <Lancamentos setS={setS} list={list} />}
      {view === 'fixas' && <Fixas S={S} setS={setS} refDate={refDate} />}
      {view === 'orc' && <Orcamento S={S} setS={setS} />}
      {view === 'metas' && <Metas S={S} setS={setS} />}
      {view === 'dados' && <Dados S={S} setS={setS} />}
    </div>
  )
}
