import { iso } from '../utils'
import { EMPTY } from '../useStore'

const baixar = (nome, txt, tipo) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([txt], { type: tipo }))
  a.download = nome
  a.click()
}

export default function Dados({ S, setS }) {
  const csv = () => {
    const q = s => '"' + String(s).replace(/"/g, '""') + '"'
    const linhas = S.tx.slice().sort((a, b) => a.date.localeCompare(b.date))
      .map(t => [t.date, t.type === 'in' ? 'Entrada' : 'Saída', q(t.desc), t.cat, String(t.val).replace('.', ','), t.paid ? 'Sim' : 'Não'].join(';'))
    baixar('lancamentos.csv', 'Data;Tipo;Descrição;Categoria;Valor;Pago\n' + linhas.join('\n'), 'text/csv')
  }
  const importar = f => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const d = JSON.parse(r.result)
        if (!Array.isArray(d.tx)) throw 0
        if (confirm('Substituir os dados atuais pelo backup?')) setS({ ...EMPTY, ...d })
      } catch { alert('Arquivo inválido.') }
    }
    r.readAsText(f)
  }

  return (
    <>
    <div className="card">
      <h2>Saldo inicial</h2>
      <p><small>Quanto você tinha em conta antes do primeiro lançamento. Entra no saldo em caixa do Resumo.</small></p>
      <input type="number" step="0.01" style={{ width: 180 }} value={S.saldo0 || ''} onChange={e => setS(s => ({ ...s, saldo0: parseFloat(e.target.value) || 0 }))} />
    </div>
    <div className="card">
      <h2>Backup e dados</h2>
      <p><small>Os dados ficam salvos só neste navegador. Faça backup com frequência, principalmente antes de trocar de aparelho.</small></p>
      <div className="f">
        <button className="b p" onClick={() => baixar(`financeiro-backup-${iso(new Date())}.json`, JSON.stringify(S, null, 1), 'application/json')}>Exportar backup (JSON)</button>
        <button className="b" onClick={csv}>Exportar CSV</button>
        <label className="b">Importar backup<input type="file" accept=".json" hidden onChange={e => importar(e.target.files[0])} /></label>
        <button className="b" onClick={() => confirm('Apagar TUDO?') && setS(EMPTY)}>Apagar tudo</button>
      </div>
    </div>
    </>
  )
}
