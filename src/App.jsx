import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const isUpdating = useRef(false)

  useEffect(() => {
    const id = localStorage.getItem('user_id') || crypto.randomUUID()
    localStorage.setItem('user_id', id)
    setUserId(id)
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from('counter')
        .select('value')
        .eq('id', 1)
        .single()

      if (data) {
        setCount(data.value)
      } else {
        toast.error('❌ Failed to load counter')
      }
      setLoading(false)
    }

    fetchCount()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('public:counter')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'counter' },
        (payload) => {
          if (!isUpdating.current) {
            setCount(payload.new.value)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('user_id, value')
        .order('value', { ascending: false })

      if (data) setLeaderboard(data)
    }

    fetchLeaderboard()
  }, [count])

  const increment = async () => {
    if (count === null || userId === null) return

    const newCount = count + 1
    setCount(newCount)
    isUpdating.current = true

    const { error } = await supabase
      .from('counter')
      .update({ value: newCount })
      .eq('id', 1)

    isUpdating.current = false

    if (error) {
      toast.error('❌ Update failed. Rolling back.')
      setCount(count)
      return
    }

    const { error: upErr } = await supabase
      .from('leaderboard')
      .upsert({ user_id: userId, value: newCount }, { onConflict: 'user_id' })

    if (upErr) {
      toast.warning('⚠️ Failed to update leaderboard')
    } else {
      toast.success('✅ Count updated successfully')
    }
  }

  return (
    <>
      <ToastContainer />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: 0 }}>📡 Real-Time Counter App</h1>
          <p style={{ marginTop: 4 }}>This app demonstrates real-time data sync using React + Supabase.</p>
        </div>
        <a
          href="https://github.com/krnomad/real-time-counter"
          target="_blank"
          rel="noopener noreferrer"
          title="View source on GitHub"
          style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center' }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#333' }}
          >
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33C4 14.91 
              3.48 13.59 3.48 13.59c-.36-.91-.88-1.15-.88-1.15-.72-.5.05-.49.05-.49.8.06 
              1.22.83 1.22.83.71 1.21 1.87.86 2.33.66.07-.52.28-.86.5-1.06-2.67-.3-5.47-1.34-5.47-5.95 
              0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.16 
              0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0C12.99 2.09 
              14 2.4 14 2.4c.66 1.64.24 2.86.12 3.16.77.84 
              1.23 1.91 1.23 3.23 0 4.61-2.8 5.64-5.48 5.94.29.25.54.73.54 
              1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </a>
      </header>

      <section style={{ backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '10px', margin: '1rem 0' }}>
        <h2>🔧 Architecture</h2>
        <svg width="100%" height="120">
          <rect x="10" y="30" width="120" height="40" rx="10" fill="#61dafb" />
          <text x="70" y="55" fontSize="14" fill="black" textAnchor="middle">React App</text>

          <line x1="130" y1="50" x2="250" y2="50" stroke="gray" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="250" y="20" width="150" height="30" rx="5" fill="#3ecf8e" />
          <text x="325" y="40" fontSize="12" fill="white" textAnchor="middle">Supabase Realtime</text>

          <rect x="250" y="60" width="150" height="30" rx="5" fill="#0f172a" />
          <text x="325" y="80" fontSize="12" fill="white" textAnchor="middle">PostgreSQL DB</text>

          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="gray" />
            </marker>
          </defs>
        </svg>
        <ul>
          <li>💬 Uses <strong>Supabase Realtime</strong> via WebSocket</li>
          <li>🚀 Instant UI with <strong>optimistic update</strong></li>
          <li>🔁 Automatic rollback on failure</li>
          <li>🏅 Tracks individual count per user in <strong>leaderboard</strong></li>
        </ul>
      </section>

      <section className="card">
        <button onClick={increment} disabled={loading || count === null}>
          {loading ? 'Loading...' : `🔼 Count is ${count}`}
        </button>
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        <ul>
          {leaderboard.map((entry) => (
            <li key={entry.user_id}>
              {entry.user_id.slice(0, 8)}...: {entry.value}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default App
