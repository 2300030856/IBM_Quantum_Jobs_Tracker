import React, { useEffect, useMemo, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { FiDownload } from "react-icons/fi"   

const DEFAULT_DATA = [
  
  { backend: 'ibm_oslo',    pending: 14, online: true,  predicted: 28 },
  { backend: 'ibm_perth',   pending:  9, online: true,  predicted: 18 },
  { backend: 'ibm_nairobi', pending: 21, online: false, predicted: 42 },
  { backend: 'ibm_lagos',   pending:  6, online: true,  predicted: 12 },
  { backend: 'ibm_cairo',   pending: 17, online: true,  predicted: 34 },
  { backend: 'ibm_tokyo',   pending: 11, online: true,  predicted: 22 },
  { backend: 'ibm_sydney',  pending: 15, online: false, predicted: 30 },
  { backend: 'ibm_paris',   pending:  7, online: true,  predicted: 14 },
  { backend: 'ibm_berlin',  pending: 20, online: true,  predicted: 40 },
  { backend: 'ibm_toronto', pending: 12, online: true,  predicted: 24 },
]

// simple interval hook
function useInterval(callback, delay) {
  const saved = useRef(callback)
  useEffect(() => { saved.current = callback }, [callback])
  useEffect(() => {
    if (delay == null) return
    const id = setInterval(() => saved.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

function JobsChart({ rows, chartType, history }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    let config
    if (chartType === 'line') {
      config = {
        type: 'line',
        data: {
          labels: history.map(h => new Date(h.time).toLocaleTimeString()),
          datasets: rows.map(r => ({
            label: r.backend,
            data: history.map(h => {
              const backendData = h.rows.find(x => x.backend === r.backend)
              return backendData ? backendData.pending : null
            }),
            fill: false,
            borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
            tension: 0.2
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } }
        }
      }
    } else {
      const labels = rows.map(r => r.backend)
      const data = rows.map(r => r.pending)
      config = {
        type: chartType,
        data: {
          labels,
          datasets: [{
            label: 'Pending Jobs',
            data,
            backgroundColor: [
              '#6366f1','#22c55e','#f59e0b','#ef4444',
              '#3b82f6','#14b8a6','#8b5cf6','#ec4899'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: chartType === 'pie' } },
          scales: chartType === 'bar'
            ? { y: { beginAtZero: true } }
            : {}
        }
      }
    }

    chartRef.current = new Chart(ctx, config)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartType, JSON.stringify(rows), JSON.stringify(history)])

  return (
    <div style={{ height: 240 }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default function App() {
  const [rows, setRows]   = useState(DEFAULT_DATA)
  const [status, setStatus] = useState('Idle')
  const [paused, setPaused] = useState(false)
  const [intervalMs, setIntervalMs] = useState(10_000)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('pending_desc')
  const [show, setShow] = useState('all')
  const [chartType, setChartType] = useState('bar')
  const [history, setHistory] = useState([])

  // ✅ Pagination states
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const fetchData = async () => {
    try {
      setStatus('Fetching…')
      const res = await fetch('/api/backends', { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      const mapped = (Array.isArray(json) ? json : []).map(r => ({
        backend: String(r.backend ?? ''),
        pending: Number(r.pending ?? 0),
        online:  Boolean(r.online ?? false),
        predicted: (typeof r.predicted_wait_min === 'number'
          ? r.predicted_wait_min
          : Number(r.pending ?? 0) * 2.0)
      }))
      if (mapped.length === 0) {
        setRows(DEFAULT_DATA)
        setStatus('Simulated (API empty)')
        return
      }
      setRows(mapped)
      setStatus('Live from /api/backends')

      setHistory(h => [...h, { time: Date.now(), rows: mapped }].slice(-20))
    } catch (e) {
      console.warn('API failed, using fallback', e)
      setRows(DEFAULT_DATA.map(r => ({
        ...r,
        pending: Math.max(0, r.pending + (Math.random() < 0.5 ? -1 : 1)),
        predicted: (Math.max(0, r.pending) * 2.0)
      })))
      setStatus('Simulated (API unreachable)')
    }
  }

  useEffect(() => { fetchData() }, [])
  useInterval(() => { if (!paused) fetchData() }, paused ? null : intervalMs)

  const filtered = useMemo(() => {
    let list = rows
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(r => r.backend.toLowerCase().includes(q))
    if (show === 'online')  list = list.filter(r => !!r.online)
    if (show === 'offline') list = list.filter(r => !r.online)
    switch (sort) {
      case 'pending_asc': list = [...list].sort((a,b)=>a.pending-b.pending); break
      case 'name_asc':    list = [...list].sort((a,b)=>a.backend.localeCompare(b.backend)); break
      default:            list = [...list].sort((a,b)=>b.pending-a.pending)
    }
    return list
  }, [rows, search, sort, show])

  // ✅ Apply pagination
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, page, rowsPerPage])

  const totalPages = Math.ceil(filtered.length / rowsPerPage)

  const totalPending = filtered.reduce((sum, r) => sum + r.pending, 0)
  const avgWait = filtered.length > 0
    ? (filtered.reduce((sum, r) => sum + r.predicted, 0) / filtered.length).toFixed(1)
    : 0
  const onlineCount = filtered.filter(r => r.online).length
  const offlineCount = filtered.filter(r => !r.online).length
  const mostBusy = filtered.length ? filtered.reduce((a,b)=>a.pending > b.pending ? a : b) : null
  const leastBusy = filtered.length ? filtered.reduce((a,b)=>a.pending < b.pending ? a : b) : null

  const bestBackend = filtered.filter(r => r.online).reduce((best, r) => {
    if (!best || r.predicted < best.predicted) return r
    return best
  }, null)

  // ✅ CSV Download
  const downloadCSV = () => {
    const header = ["Backend,Pending,Online,Predicted"]
    const body = filtered.map(r =>
      `${r.backend},${r.pending},${r.online ? "Online" : "Offline"},${r.predicted}`
    )
    const csvContent = [...header, ...body].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "backends.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
   <div style={{ width: "100%", padding: "12px" }}>
      <div className="card" style={{marginBottom: 12}}>
        <div className="content">
          <div className="controls">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search backend" />
            <select value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="pending_desc">Pending (High→Low)</option>
              <option value="pending_asc">Pending (Low→High)</option>
              <option value="name_asc">Name (A→Z)</option>
            </select>
            <select value={show} onChange={e=>setShow(e.target.value)}>
              <option value="all">All</option>
              <option value="online">Online only</option>
              <option value="offline">Offline only</option>
            </select>
            <select value={String(intervalMs/1000)} onChange={e=>setIntervalMs(Number(e.target.value)*1000)}>
              <option value="5">Refresh: 5s</option>
              <option value="10">Refresh: 10s</option>
              <option value="15">Refresh: 15s</option>
            </select>
            <button onClick={()=>setPaused(true)}>Pause</button>

            {/* Resume + Download side by side */}
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <button className="primary" onClick={()=>setPaused(false)}>Resume</button>
              <button
                onClick={downloadCSV}
                style={{
                  marginLeft: "6px",
                  background: "#2563eb",
                  color: "#fff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Download CSV"
              >
                <FiDownload size={20} />
              </button>
            </div>
          </div>
          <div className="muted" style={{marginTop:6}}>Status: {status}</div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="row" style={{marginBottom:16}}>
        <div className="card grid-1-2"><div className="content"><h3>Total Pending</h3><p>{totalPending}</p></div></div>
        <div className="card grid-1-2"><div className="content"><h3>Avg Predicted Wait</h3><p>{avgWait} min</p></div></div>
        <div className="card grid-1-2"><div className="content"><h3>Online</h3><p>{onlineCount}</p></div></div>
        <div className="card grid-1-2"><div className="content"><h3>Offline</h3><p>{offlineCount}</p></div></div>
        <div className="card grid-1-2"><div className="content"><h3>Most Busy</h3><p>{mostBusy?.backend} ({mostBusy?.pending})</p></div></div>
        <div className="card grid-1-2"><div className="content"><h3>Least Busy</h3><p>{leastBusy?.backend} ({leastBusy?.pending})</p></div></div>
      </div>

      {/* TABLE + CHART */}
      <div className="row">
        <div className="card grid-2-1">
          <h2>Backends & Queues</h2>
          <div className="content">
            <div style={{overflow:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Backend</th>
                    <th>Pending Jobs</th>
                    <th>Online</th>
                    <th>Predicted Wait (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r,i)=>(
                    <tr key={i}>
                      <td>{r.backend}</td>
                      <td>{r.pending}</td>
                      <td>
                        {r.online
                          ? <span className="badge ok">Online</span>
                          : <span className="badge bad">Offline</span>}
                      </td>
                      <td>{(r.predicted ?? (r.pending * 2)).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
            <div style={{ marginTop: "8px", textAlign: "center" }}>
              <span style={{ marginRight: "8px" }}>Rows per page: </span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>

              <div style={{ marginTop: "8px" }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    style={{
                      margin: "0 4px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      background: page === i + 1 ? "#2563eb" : "#f3f4f6",
                      color: page === i + 1 ? "#fff" : "#111",
                      cursor: "pointer"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card grid-1-1">
          <h2>
            Pending Jobs
            <select
              style={{ marginLeft: 8 }}
              value={chartType}
              onChange={e => setChartType(e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="line">Line</option>
            </select>
          </h2>
          <div className="content">
            {filtered.length > 0
              ? <JobsChart rows={filtered} chartType={chartType} history={history} />
              : <div className="muted">No data to plot</div>}
          </div>
        </div>
      </div>

      {/* Floating Banner */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: bestBackend ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontWeight: "bold",
        fontSize: "0.95rem",
        zIndex: 1000
      }}>
        {bestBackend
          ? <> Best Backend: {bestBackend.backend} ({bestBackend.predicted.toFixed(1)} min wait)</>
          : <> No Best backend available</>}
      </div>
    </div>
  )
}
