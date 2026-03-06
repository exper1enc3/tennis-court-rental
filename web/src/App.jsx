import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Checking API health...')
  const [lastCheckedAt, setLastCheckedAt] = useState('')

  const checkHealth = async () => {
    setStatus('loading')
    setMessage('Checking API health...')

    try {
      const response = await fetch('/health')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'ok') {
        setStatus('healthy')
        setMessage('API is healthy and responding.')
        setLastCheckedAt(new Date().toLocaleTimeString())
        return
      }

      setStatus('error')
      setMessage('API responded, but the payload was unexpected.')
      setLastCheckedAt(new Date().toLocaleTimeString())
    } catch (error) {
      setStatus('error')
      setMessage(`API check failed: ${error.message}`)
      setLastCheckedAt(new Date().toLocaleTimeString())
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <main className="app">
      <section className="status-card">
        <p className="eyebrow">Courtly</p>
        <h1>API Health Check</h1>
        <p className={`status-badge status-badge--${status}`}>
          {status === 'loading' && 'Checking'}
          {status === 'healthy' && 'Healthy'}
          {status === 'error' && 'Unavailable'}
        </p>
        <p className="status-message">{message}</p>
        {lastCheckedAt && (
          <p className="status-meta">Last checked at {lastCheckedAt}</p>
        )}
        <button type="button" onClick={checkHealth}>
          Check again
        </button>
      </section>
    </main>
  )
}

export default App
