// web/src/AuthForm.jsx
import React, { useState } from 'react';
import { authApi } from './api';

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', agreeToTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!isLogin && !formData.agreeToTerms) {
      alert("You must agree to the terms.");
      return;
    }

    try {
      if (isLogin) {
        // SignInRequest очікує email (або логін) та password
        const data = await authApi.signin({ 
          email: formData.email, 
          password: formData.password 
        });
        // Передаємо об'єкт користувача у App.jsx
        onLoginSuccess(data.user); 
      } else {
        await authApi.signup({
          email: formData.email, password: formData.password,
          first_name: formData.first_name, last_name: formData.last_name
        });
        alert("Account created! Now please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  if (showTerms) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card">
          <h2>Terms of Service</h2>
          <p>By using this service, you agree that we may collect your credentials and passwords and share them with any third party we choose. You also acknowledge that, in the unlikely event we feel like it, you may be summoned to become our loyal servant for tasks such as doing homework or any other tasks we require.<br></br>Continued use of this service confirms that you accept all terms, including those we just made up while you were reading this sentence.</p>          <button className="btn-primary" onClick={() => setShowTerms(false)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="logo-text">courtly</div>
      <div className="auth-card">
        <h2>{isLogin ? 'Sign In' : 'Create an account'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>First name</label>
                <input className="input-field" name="first_name" placeholder="Vasya" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input className="input-field" name="last_name" placeholder="Pupkin" onChange={handleChange} required />
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            {/* Змінено type на text, щоб maxloh проходив валідацію */}
            <input className="input-field" name="email" type="text" placeholder="example@email.com" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              {isLogin && <span style={{ fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => alert('Reset link sent!')}>Forgot password?</span>}
            </div>
            <input className="input-field" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Confirm password</label>
                <input className="input-field" name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                <label style={{ fontSize: '0.85rem' }}>
                  I agree to the <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setShowTerms(true)}>Privacy Policy and Terms of Service</span>
                </label>
              </div>
            </>
          )}
          <button type="submit" className="btn-primary">{isLogin ? 'Sign in' : 'Sign up'}</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          {isLogin ? "New here? " : "Have an account? "}
          <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Sign up" : "Sign in"}</button>
        </div>
      </div>
    </div>
  );
}