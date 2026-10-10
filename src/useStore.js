import { useState, useEffect } from 'react'

const KEY = 'meu-financeiro-v1'
export const EMPTY = { tx: [], rec: [], bud: {}, goals: [], saldo0: 0 }

export function useStore() {
  const [S, setS] = useState(() => {
    try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return EMPTY }
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch {} }, [S])
  return [S, setS]
}
