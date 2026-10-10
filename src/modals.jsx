import { useState } from 'react'
import Modal from './components/Modal'
import { CO, CI, iso, brl } from './utils'

const F = ({ l, children }) => <label className="fl"><span>{l}</span>{children}</label>
const cats = t => (t === 'in' ? CI : CO)
const Acoes = ({ onClose, onSave, txt = 'Salvar' }) => (
  <div className="ma"><button className="b" onClick={onClose}>Cancelar</button><button className="b mc" onClick={onSave}>{txt}</button></div>
)

export function TxModal({ tipo, init, onSave, onClose }) {
  const [f, setF] = useState(init || { type: tipo, desc: '', val: '', date: iso(new Date()), cat: cats(tipo)[0], paid: true, n: 1 })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const ent = f.type === 'in', parc = !init && !ent, n = Math.min(60, Math.max(1, parseInt(f.n) || 1))
  const salvar = () => {
    const val = parseFloat(f.val)
    if (!f.desc.trim() || !(val > 0) || !f.date) return alert('Preencha descrição, valor e data.')
    onSave({ ...f, desc: f.desc.trim(), val, n: parc ? n : 1 })
  }
  return (
    <Modal title={init ? 'Editar lançamento' : ent ? 'Nova entrada' : 'Nova saída'} cor={ent ? 'var(--in)' : 'var(--out)'} onClose={onClose}>
      <F l="Descrição"><input autoFocus value={f.desc} onChange={e => set('desc', e.target.value)} /></F>
      <F l={n > 1 ? 'Valor total' : 'Valor'}><input type="number" step="0.01" min="0" value={f.val} onChange={e => set('val', e.target.value)} /></F>
      <F l={n > 1 ? 'Data da 1ª parcela' : 'Data'}><input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></F>
      <F l="Categoria"><select value={f.cat} onChange={e => set('cat', e.target.value)}>{cats(f.type).map(c => <option key={c}>{c}</option>)}</select></F>
      {parc && (
        <F l="Parcelas">
          <input type="number" min="1" max="60" value={f.n} onChange={e => set('n', e.target.value)} />
          {n > 1 && parseFloat(f.val) > 0 && <small>{n}x de {brl(parseFloat(f.val) / n)}, uma por mês</small>}
        </F>
      )}
      <label className="fl"><input type="checkbox" checked={f.paid} onChange={e => set('paid', e.target.checked)} /> {ent ? 'Já recebido' : n > 1 ? 'Primeira parcela já paga' : 'Já pago'}</label>
      <Acoes onClose={onClose} onSave={salvar} />
    </Modal>
  )
}

export function FixaModal({ init, onSave, onClose }) {
  const [f, setF] = useState(init || { type: 'out', desc: '', val: '', day: '', cat: CO[0] })
  const set = (k, v) => setF(p => ({ ...p, [k]: v, ...(k === 'type' ? { cat: cats(v)[0] } : {}) }))
  const salvar = () => {
    const val = parseFloat(f.val), day = parseInt(f.day)
    if (!f.desc.trim() || !(val > 0) || !(day >= 1 && day <= 31)) return alert('Preencha descrição, valor e dia (1–31).')
    onSave({ ...f, desc: f.desc.trim(), val, day })
  }
  return (
    <Modal title={init ? 'Editar fixa' : 'Nova conta/receita fixa'} onClose={onClose}>
      <F l="Tipo"><select value={f.type} onChange={e => set('type', e.target.value)}><option value="out">Saída</option><option value="in">Entrada</option></select></F>
      <F l="Descrição"><input autoFocus value={f.desc} onChange={e => set('desc', e.target.value)} /></F>
      <F l="Valor mensal"><input type="number" step="0.01" min="0" value={f.val} onChange={e => set('val', e.target.value)} /></F>
      <F l="Dia do mês"><input type="number" min="1" max="31" value={f.day} onChange={e => set('day', e.target.value)} /></F>
      <F l="Categoria"><select value={f.cat} onChange={e => set('cat', e.target.value)}>{cats(f.type).map(c => <option key={c}>{c}</option>)}</select></F>
      <Acoes onClose={onClose} onSave={salvar} />
    </Modal>
  )
}

export function MetaModal({ init, onSave, onClose }) {
  const [f, setF] = useState(init || { name: '', target: '', prazo: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const salvar = () => {
    const target = parseFloat(f.target)
    if (!f.name.trim() || !(target > 0)) return alert('Preencha nome e valor alvo.')
    onSave({ ...f, name: f.name.trim(), target })
  }
  return (
    <Modal title={init ? 'Editar meta' : 'Nova meta'} cor="#8b5cf6" onClose={onClose}>
      <F l="Nome"><input autoFocus placeholder="Ex.: Reserva de emergência" value={f.name} onChange={e => set('name', e.target.value)} /></F>
      <F l="Valor alvo"><input type="number" min="1" value={f.target} onChange={e => set('target', e.target.value)} /></F>
      <F l="Prazo (opcional)"><input type="date" value={f.prazo || ''} onChange={e => set('prazo', e.target.value)} /></F>
      <Acoes onClose={onClose} onSave={salvar} />
    </Modal>
  )
}

export function AporteModal({ meta, onSave, onClose }) {
  const [v, setV] = useState('')
  const [t, setT] = useState('+')
  const salvar = () => {
    const x = parseFloat(v)
    if (!(x > 0)) return alert('Informe um valor.')
    onSave(meta.id, t === '+' ? x : -x)
  }
  return (
    <Modal title={`Movimentar: ${meta.name}`} cor="#8b5cf6" onClose={onClose}>
      <small>Guardado: {brl(meta.saved)} de {brl(meta.target)}</small>
      <F l="Operação"><select value={t} onChange={e => setT(e.target.value)}><option value="+">Aporte</option><option value="-">Retirada</option></select></F>
      <F l="Valor"><input autoFocus type="number" min="0" step="0.01" value={v} onChange={e => setV(e.target.value)} /></F>
      <Acoes onClose={onClose} onSave={salvar} txt="Confirmar" />
    </Modal>
  )
}
