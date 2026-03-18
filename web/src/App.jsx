import { useState } from 'react'
import './App.css'
import AuthForm from './AuthForm'

function Logo({ inBadge = false }) {
  return (
    <div className={inBadge ? 'logo logo--badge' : 'logo'} aria-label="courtly logo">
      <span className="logo__text">c</span>
      <span className="logo__ball" />
      <span className="logo__text">urtly</span>
    </div>
  )
}

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)

  return (
    <main className="app">
      {!showAuth && !user && (
        <section className="hero">
          <div className="hero__card">
            <div className="hero__badge">
              <Logo inBadge />
            </div>

            <div className="court">
              <div className="court__outer" />
              <div className="court__topLine" />
              <div className="court__bottomLine" />
              <div className="court__leftInner" />
              <div className="court__rightInner" />
              <div className="court__centerService" />
              <div className="court__net" />
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

      {user && (
        <section className="auth-page">
          <div className="auth-page__inner">
            <Logo />
            <div className="auth-card">
              <h2 className="auth-card__title">
                {user.first_name} {user.last_name}
              </h2>

              <p className="auth-card__logged">
                You are successfully logged in as a {user.role}.
              </p>

              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setUser(null)
                  setShowAuth(false)
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App