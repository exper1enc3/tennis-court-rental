import { useState } from 'react'
import { authApi } from './api'

function EyeButton({ shown, onClick }) {
  return (
    <button
      type="button"
      className="eye-button"
      onClick={onClick}
      aria-label="Toggle password visibility"
    >
      {shown ? '🙈' : '👁'}
    </button>
  )
}

function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match.')
        return
      }

      if (!formData.agreeToTerms) {
        alert('You must agree to the Privacy Policy and Terms of Service.')
        return
      }
    }

    try {
      if (isLogin) {
        const data = await authApi.signin({
          email: formData.email,
          password: formData.password,
        })
        console.log(data)
        onLoginSuccess(data.user)
      } else {
        await authApi.signup({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        })

        alert('Account created successfully. Now sign in.')

        setIsLogin(true)
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
          agreeToTerms: false,
        }))
      }
    } catch (err) {
      alert(err.message || 'Something went wrong.')
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-card__title">
        {isLogin ? 'Sign In' : 'Create an account'}
      </h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                className="auth-input"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Vasya"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                className="auth-input"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Pupkin"
                required
              />
            </div>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field__row">
            <label htmlFor="password">Password</label>
            {isLogin && (
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => alert('Forgot password flow is not added yet.')}
              >
                Forgot password?
              </button>
            )}
          </div>

          <div className="auth-input-wrap">
            <input
              id="password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
            {!isLogin && (
              <EyeButton
                shown={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              />
            )}
          </div>
        </div>

        {!isLogin && (
          <>
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="auth-input-wrap">
                <input
                  id="confirmPassword"
                  className="auth-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
                <EyeButton
                  shown={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                />
              </div>
            </div>

            <div className="auth-terms">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <span className="auth-checkbox__mark" />
              </label>

              <div className="auth-terms__text">
                I agree to the{' '}
                <span className="auth-underline">Privacy Policy</span> and{' '}
                <span className="auth-underline">Terms of Service</span>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="auth-submit">
          {isLogin ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <div className="auth-switch">
        {isLogin ? (
          <>
            New here?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => setIsLogin(false)}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthForm