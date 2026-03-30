import React from 'react';
import { Logo } from './App';

export default function Profile({ user, onLogout }) {
  const fullName = `${user.first_name} ${user.last_name}`.toUpperCase();

  return (
    <div className="profile-page">
      {/* РЯДОК 1: Шапка з Логотипом (Верхній відступ перед лого прибрано) */}
      <div className="bp-cell"></div>
      <div className="bp-cell profile-logo-cell">
        <div className="logo-wrapper logo--dark">
          <Logo inBadge={false} />
        </div>
      </div>
      <div className="bp-cell"></div>
      <div className="bp-cell bp-cell--no-right"></div>

      {/* РЯДОК 2: Основний контент (Сайдбар + Зона для бронювань) */}
      <div className="bp-cell"></div>
      
      <div className="bp-cell profile-sidebar-cell">
        {/* Секція юзера: має власні відступи і чорну пунктирну лінію знизу */}
        <div className="profile-user-section">
          <div className="profile-user__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className="profile-user__name">{fullName}</span>
        </div>
        
        {/* Секція з кнопкою */}
        <div className="profile-logout-section">
          <button className="profile-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="bp-cell">
        {/* Центральна частина, куди пізніше додамо картки бронювань */}
      </div>
      <div className="bp-cell bp-cell--no-right"></div>

      {/* РЯДОК 3: Нижні відступи */}
      <div className="bp-cell bp-cell--no-bottom"></div>
      <div className="bp-cell bp-cell--no-bottom"></div>
      <div className="bp-cell bp-cell--no-bottom"></div>
      <div className="bp-cell bp-cell--no-right bp-cell--no-bottom"></div>
    </div>
  );
}