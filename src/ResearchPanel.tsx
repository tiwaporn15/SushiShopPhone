import type { ResearchLogApi } from './useResearchLog'
import type { SetId, TaskNo } from './taskSets'

interface ResearchPanelProps {
  api: ResearchLogApi
  open: boolean
  onClose: () => void
}
export default function ResearchPanel({ api, open, onClose }: ResearchPanelProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="order-sheet research-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="sheet-heading">
          <h2 id="research-title">แผงเก็บข้อมูลวิจัย</h2>
          <button className="close" onClick={onClose} aria-label="ปิด">
            ×
          </button>
        </div>

        <label className="switch-row">
          <input
            type="checkbox"
            checked={api.enabled}
            onChange={(event) => api.setEnabled(event.target.checked)}
          />
          <span>เปิดโหมดเก็บข้อมูล (นับ error / เวลา อัตโนมัติตอนกด &quot;Confirm Order&quot;)</span>
        </label>

        <div className="research-form">
          <label className="field">
            <span>Participant ID</span>
            <input
              type="text"
              value={api.participantId}
              onChange={(event) => api.setParticipantId(event.target.value)}
              placeholder="เช่น P01"
            />
          </label>
          <label className="field">
            <span>Task</span>
            <select
              value={api.task}
              onChange={(event) => api.setTask(Number(event.target.value) as TaskNo)}
            >
              <option value={1}>Task 1 — Easy</option>
              <option value={2}>Task 2 — Complex</option>
            </select>
          </label>
          <label className="field">
            <span>ชุด (Set)</span>
            <select value={api.set} onChange={(event) => api.setSet(event.target.value as SetId)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>
        </div>

        <div className="trial-row">
          <button
            className="trial-btn"
            onClick={() => {
              const wasRunning = api.trialRunning
              api.startTrial()
              if (!wasRunning) onClose()
            }}
          >
            {api.trialRunning ? 'ยกเลิกการจับเวลา' : 'เริ่มจับเวลา'}
          </button>
          <div className="trial-status">
            {api.trialRunning
              ? `กำลังจับเวลา — ${api.participantId || '(ยังไม่ใส่ Participant ID)'} · Task ${api.task} · Set ${api.set}`
              : 'ยังไม่ได้เริ่มจับเวลา'}
          </div>
        </div>

        <div className="research-table-wrap">
          <table className="research-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Method</th>
                <th>Task</th>
                <th>Set</th>
                <th>Decision&nbsp;Time</th>
                <th>Missing</th>
                <th>Extra</th>
                <th>WrongQty</th>
                <th>Error</th>
                <th>Success</th>
              </tr>
            </thead>
            <tbody>
              {[...api.log].reverse().map((r, index) => (
                <tr key={`${r.at}-${index}`}>
                  <td>{r.participantId}</td>
                  <td>{r.method}</td>
                  <td>{r.task}</td>
                  <td>{r.set}</td>
                  <td>{r.timeSec}s</td>
                  <td>{r.missing}</td>
                  <td>{r.extra}</td>
                  <td>{r.wrongQty}</td>
                  <td>{r.totalError}</td>
                  <td>{r.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {api.log.length === 0 && <div className="research-empty">ยังไม่มีข้อมูลที่บันทึกไว้</div>}
        </div>

        <div className="research-actions">
          <button className="pill-outline" onClick={api.exportCsv}>
            ส่งออกเป็น Excel (CSV)
          </button>
          <button
            className="pill-danger"
            onClick={() => {
              if (api.log.length === 0) return
              if (window.confirm('ล้างข้อมูลผลการทดลองทั้งหมดหรือไม่? การกระทำนี้ย้อนกลับไม่ได้')) {
                api.clearLog()
              }
            }}
          >
            ล้างข้อมูลทั้งหมด
          </button>
        </div>
      </section>
    </div>
  )
}
