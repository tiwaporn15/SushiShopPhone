import { useCallback, useEffect, useState } from 'react'
import { findTaskSet, type SetId, type TaskNo } from './taskSets'

export interface ResearchRecord {
  participantId: string
  method: 'QR'
  task: TaskNo
  set: SetId
  timeSec: number
  missing: number
  extra: number
  wrongQty: number
  /** ระบบสั่งอาหารแบบเลือกอิสระ ไม่มี "ช่องว่าง" ตายตัวแบบกระดาษ จึงตรวจจับ Wrong Item อัตโนมัติไม่ได้ เก็บไว้เป็น 0 เสมอเพื่อให้ schema ครบ */
  wrongItem: number
  totalError: number
  success: 0 | 1
  at: string
}
const STORAGE_KEY = 'sushiShopResearchLog'

function loadLog(): ResearchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLog(log: ResearchRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    /* storage unavailable — logging still works for this session */
  }
}

/** เทียบตะกร้า (quantities) กับชุดโจทย์ที่เลือก แล้วนับ error 3 ประเภทที่ตรวจอัตโนมัติได้ */
export function scoreAgainstTarget(
  quantities: Record<string, number>,
  task: TaskNo,
  set: SetId,
): { missing: number; extra: number; wrongQty: number } {
  const target = findTaskSet(task, set)
  const targetLines = target?.lines ?? []
  const targetIds = new Set(targetLines.map((l) => l.itemId))

  let missing = 0
  let wrongQty = 0
  for (const line of targetLines) {
    const actual = quantities[line.itemId] ?? 0
    if (actual === 0) missing += 1
    else if (actual !== line.qty) wrongQty += 1
  }

  let extra = 0
  for (const [id, qty] of Object.entries(quantities)) {
    if (qty > 0 && !targetIds.has(id)) extra += 1
  }

  return { missing, extra, wrongQty }
}

export function useResearchLog() {
  const [enabled, setEnabled] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [task, setTask] = useState<TaskNo>(1)
  const [set, setSet] = useState<SetId>('A')
  const [trialRunning, setTrialRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [log, setLog] = useState<ResearchRecord[]>(() => loadLog())

  useEffect(() => {
    saveLog(log)
  }, [log])

  const startTrial = useCallback(() => {
    if (trialRunning) {
      setTrialRunning(false)
      setStartedAt(null)
      return
    }
    setTrialRunning(true)
    setStartedAt(Date.now())
  }, [trialRunning])

  /**
   * เรียกตอนกด "Confirm Order" — คืนค่า record ที่บันทึกถ้าอยู่ใน trial ที่กำลังจับเวลาอยู่
   * คืน null เมื่อไม่ได้เปิดโหมดเก็บข้อมูล หรือยังไม่ได้กด "เริ่มจับเวลา" (ออเดอร์ยังยืนยันได้ตามปกติ แค่ไม่บันทึก)
   */
  const recordResult = useCallback(
    (quantities: Record<string, number>): ResearchRecord | null => {
      if (!enabled || !trialRunning || startedAt === null) return null

      const timeSec = Math.round((Date.now() - startedAt) / 1000)
      const { missing, extra, wrongQty } = scoreAgainstTarget(quantities, task, set)
      const totalError = missing + extra + wrongQty

      const record: ResearchRecord = {
        participantId: participantId.trim() || '(ไม่ระบุ)',
        method: 'QR',
        task,
        set,
        timeSec,
        missing,
        extra,
        wrongQty,
        wrongItem: 0,
        totalError,
        success: totalError === 0 ? 1 : 0,
        at: new Date().toISOString(),
      }

      setLog((prev) => [...prev, record])
      setTrialRunning(false)
      setStartedAt(null)
      return record
    },
    [enabled, trialRunning, startedAt, task, set, participantId],
  )

  const clearLog = useCallback(() => {
    setLog([])
  }, [])

  const exportCsv = useCallback(() => {
    const header = [
      'ID',
      'Method',
      'Task',
      'Set',
      'DecisionTimeSec',
      'MissingItem',
      'ExtraItem',
      'WrongQuantity',
      'WrongItem',
      'TotalError',
      'Success',
      'Timestamp',
    ]
    const rows = log.map((r) =>
      [r.participantId, r.method, r.task, r.set, r.timeSec, r.missing, r.extra, r.wrongQty, r.wrongItem, r.totalError, r.success, r.at]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
    const csv = '\uFEFF' + [header.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sushi-shop-research-log-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [log])

  return {
    enabled,
    setEnabled,
    participantId,
    setParticipantId,
    task,
    setTask,
    set,
    setSet,
    trialRunning,
    startTrial,
    recordResult,
    log,
    clearLog,
    exportCsv,
  }
}

export type ResearchLogApi = ReturnType<typeof useResearchLog>
