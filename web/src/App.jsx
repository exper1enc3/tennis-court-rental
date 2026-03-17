import { useState } from 'react'
import './App.css'
import AuthForm from './AuthForm' 

function App() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  return (
    <main className="app">
      <section className="status-card">
        <p className="eyebrow">Courtly</p>
        
        {!user ? (
          <div className="header-action">
            <h1>Welcome to Courtly</h1>
            {/* Показуємо форму лише якщо активовано showAuth */}
            {!showAuth ? (
              <button type="button" onClick={() => setShowAuth(true)}>
                Sign in / Sign up
              </button>
            ) : (
              <button type="button" onClick={() => setShowAuth(false)}>
                Cancel
              </button>
            )}

            {showAuth && (
              <AuthForm onLoginSuccess={(userData) => {
                setUser(userData)
                setShowAuth(false)
              }} />
            )}
          </div>
        ) : (
          <div className="user-profile">
            {/* Requirement: after login, replace button with full name */}
            <h1>{user.first_name} {user.last_name}</h1>
            <p className="status-message">You are successfully logged in as a {user.role}.</p>
            <button type="button" onClick={() => setUser(null)}>Logout</button>
          </div>
        )}
      </section>
    </main>
  )
}

export default App