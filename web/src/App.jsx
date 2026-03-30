import { useState } from 'react'
import './App.css'
import AuthForm from './AuthForm'
import Profile from './Profile'

const LOGO_SRC = '/courtly.png'
const HERO_BG_SRC = '/bg.png'

export function Logo({ inBadge = false }) {
  return (
    <div className={inBadge ? 'logo logo--badge' : 'logo'} aria-label="courtly logo">
      <img className="logo__image" src={LOGO_SRC} alt="Courtly" />
    </div>
  )
}

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)

  return (
    <main className="app">
      {/* 1. Головний екран (Hero), якщо не залогінені і не відкрита форма */}
      {!showAuth && !user && (
        <section className="hero">
          <div className="hero__card">
            <div className="hero__badge">
              <Logo inBadge />
            </div>

            <div className="court">
              <img className="court__image" src={HERO_BG_SRC} alt="" aria-hidden="true" />
            </div>

            <div className="hero__content">
              <h1 className="hero__title">
                FIND
                <br />
                YOUR
                <br />
                COURT
              </h1>

              <div className="hero__actions">
                <button
                  type="button"
                  className="hero__btn hero__btn--lime"
                  onClick={() => setShowAuth(true)}
                >
                  VIEW COURTS <span className="hero__icon">↗</span>
                </button>

                <button
                  type="button"
                  className="hero__btn hero__btn--dark"
                  onClick={() => setShowAuth(true)}
                >
                  HOW IT WORKS
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Екран авторизації (Sign In / Sign Up) */}
      {showAuth && !user && (
        <section className="auth-page">
          <div className="auth-page__inner">
            <Logo />
            <AuthForm
              onLoginSuccess={(userData) => {
                setUser(userData)
              }}
            />
          </div>
        </section>
      )}

      {/* 3. Кабінет користувача (Profile) */}
      {user && (
        <Profile 
          user={user} 
          onLogout={() => {
            setUser(null)
            setShowAuth(false)
          }} 
        />
      )}
    </main>
  )
}

export default App