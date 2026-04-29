import { useEffect, useMemo, useState } from "react";
import logoUrl from "../logo.svg";
import { api, setAccessToken } from "./api";

const courtVisuals = [
  "linear-gradient(135deg, rgba(199,226,29,.95), rgba(245,245,243,.7)), radial-gradient(circle at 20% 20%, #111 0 2px, transparent 3px)",
  "linear-gradient(135deg, rgba(17,17,17,.94), rgba(42,42,42,.76)), repeating-linear-gradient(90deg, transparent 0 22px, rgba(199,226,29,.42) 23px 24px)",
  "linear-gradient(135deg, rgba(236,236,232,.98), rgba(199,226,29,.46)), linear-gradient(45deg, transparent 48%, #111 49% 51%, transparent 52%)"
];

const managerRoles = new Set(["moderator", "admin", "superuser"]);

function formatMoney(value) {
  return `${value} UAH`;
}

function Logo() {
  return (
    <button className="logo" aria-label="Courtly home" type="button">
      <img src={logoUrl} alt="Courtly" />
    </button>
  );
}

export default function App() {
  const [email, setEmail] = useState("superuser@courtly.example.com");
  const [password, setPassword] = useState("ChangeMeNow123!");
  const [authMode, setAuthMode] = useState("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [token, setToken] = useState("");
  const [view, setView] = useState("home");
  const [city, setCity] = useState("Kyiv");
  const [district, setDistrict] = useState("All districts");
  const [courts, setCourts] = useState([]);
  const [activeCourtId, setActiveCourtId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [adminTab, setAdminTab] = useState("users");
  const [newUser, setNewUser] = useState({ email: "", full_name: "", password: "ChangeMeNow123!", role: "user" });
  const [newRole, setNewRole] = useState("");
  const [newPolicy, setNewPolicy] = useState({ resource: "courts", action: "read", effect: "allow", condition: "" });
  const [log, setLog] = useState([]);

  const isManager = profile ? managerRoles.has(profile.role) : false;

  const addLog = (title, payload) => {
    setLog((current) => [{ title, payload }, ...current].slice(0, 10));
  };

  async function loadCabinet(force = false) {
    if (!force && !isAuthed && !token) {
      return;
    }
    setError("");
    try {
      const [b, p, f] = await Promise.all([api.listMyBookings(), api.getProfile(), api.listFavorites()]);
      setBookings(b);
      setProfile(p);
      setFavorites((current) => [...new Set([...current, ...f.map((item) => item.court_id)])]);
      addLog("Loaded cabinet", { bookings: b, profile: p, favorites: f });
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadAdmin() {
    setError("");
    try {
      const [users, loadedRoles, loadedPolicies, allBookings] = await Promise.all([
        api.listAdminUsers(),
        api.listRoles(),
        api.listPolicies(),
        api.listBookings()
      ]);
      setAdminUsers(users);
      setRoles(loadedRoles);
      setPolicies(loadedPolicies);
      setAdminBookings(allBookings);
      addLog("Loaded admin data", { users, loadedRoles, loadedPolicies });
    } catch (err) {
      setError(err.message);
    }
  }

  async function refreshAdminAndCourts() {
    await Promise.all([loadAdmin(), loadCourts()]);
  }

  async function createAdminUser(event) {
    event.preventDefault();
    try {
      await api.createAdminUser(newUser);
      setNewUser({ email: "", full_name: "", password: "ChangeMeNow123!", role: "user" });
      setSuccess("User created.");
      await loadAdmin();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateUserRole(userId, role) {
    try {
      await api.updateAdminUser(userId, { role });
      await loadAdmin();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createRole(event) {
    event.preventDefault();
    if (!newRole.trim()) {
      return;
    }
    try {
      await api.createRole({ name: newRole.trim() });
      setNewRole("");
      await loadAdmin();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createPolicy(event) {
    event.preventDefault();
    try {
      await api.createPolicy(newPolicy);
      setNewPolicy({ resource: "courts", action: "read", effect: "allow", condition: "" });
      await loadAdmin();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updatePolicyEffect(policy, effect) {
    try {
      await api.updatePolicy(policy.id, { ...policy, effect });
      await loadAdmin();
    } catch (err) {
      setError(err.message);
    }
  }


  const isAuthed = token.length > 0;
  const activeCourt = useMemo(() => courts.find((court) => court.id === activeCourtId) || courts[0] || null, [activeCourtId, courts]);
  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const cityMatch = city === "All cities" || court.city === city;
      const districtMatch = district === "All districts" || court.district === district;
      return cityMatch && districtMatch;
    });
  }, [city, courts, district]);

  useEffect(() => {
    loadCourts();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const data = await api.login({ email, password });
      setToken(data.access_token);
      setAccessToken(data.access_token);
      setSuccess("Вхід виконано.");
      setView("home");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }
    if (!acceptedTerms) {
      setError("Потрібно погодитись з Privacy Policy та Terms of Service.");
      return;
    }
    try {
      const data = await api.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email,
        password
      });
      setToken(data.access_token);
      setAccessToken(data.access_token);
      setSuccess("Акаунт створено.");
      setView("home");
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    setToken("");
    setAccessToken("");
    setView("home");
    setSuccess("Ти вийшов з акаунту.");
  }

  async function loadCourts() {
    setError("");
    try {
      const data = await api.listCourts();
      const normalized = data.map((court, index) => ({
        ...court,
        rating: 4.6 + (index % 3) / 10,
        distance: `${(1.1 + index * 0.7).toFixed(1)} km`,
        nextSlot: index % 2 === 0 ? "18:00" : "19:30",
        image: courtVisuals[index % courtVisuals.length],
        tags: [court.surface, "Verified", "Fast booking"]
      }));
      setCourts(normalized);
      if (normalized.length > 0) {
        setActiveCourtId(normalized[0].id);
      }
    } catch (err) {
      setError(`Courts API unavailable: ${err.message}`);
    }
  }

  function selectCourt(courtId) {
    setActiveCourtId(courtId);
    setView("detail");
  }

  const nav = [
    ["home", "Головна"],
    ["search", "Корти"]
  ];
  if (isAuthed) {
    nav.push(["cabinet", "Особистий кабінет"]);
  }
  if (isAuthed && isManager) {
  nav.push(["admin", "Дашборд"]);
}

  return (
    <div className="app-shell">
      <header className="topbar">
        <div onClick={() => setView("home")}>
          <Logo />
        </div>
        <nav className="nav-tabs" aria-label="Primary navigation">
          {nav.map(([id, label]) => (
            <button key={id} className={view === id ? "nav-tab active" : "nav-tab"} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="primary-button compact user-button" onClick={() => setView("cabinet")}>
            {isAuthed ? "Account" : "Увійти"}
          </button>
          {isAuthed ? (
            <button className="ghost-button" onClick={logout}>
              Вийти
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="toast error-toast">
          <strong>Увага</strong>
          <span>{error}</span>
          <button onClick={() => setError("")}>Закрити</button>
        </div>
      ) : null}
      {success ? (
        <div className="toast success-toast">
          <strong>Готово</strong>
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>Закрити</button>
        </div>
      ) : null}

      <main>
        {view === "home" ? (
          <section className="hero-section">
            <div className="hero-content">
              <div className="eyebrow">Tennis booking</div>
              <h1>Знайди корт поруч і забронюй за хвилину</h1>
              <p>Обери корт, знайди вільний час у тижневому календарі й підтвердь бронювання без дзвінків.</p>

              <div className="search-panel">
                <label>
                  <span>Місто</span>
                  <select value={city} onChange={(event) => setCity(event.target.value)}>
                    <option>Kyiv</option>
                    <option>All cities</option>
                  </select>
                </label>
                <label>
                  <span>Район</span>
                  <select value={district} onChange={(event) => setDistrict(event.target.value)}>
                    <option>All districts</option>
                    <option>Pechersk</option>
                    <option>Podil</option>
                    <option>Obolon</option>
                  </select>
                </label>
                <button className="primary-button" onClick={() => setView("search")}>
                  Знайти корт
                </button>
              </div>
            </div>

            <aside className="hero-visual" aria-label="Courtly booking preview">
              <div className="court-lines">
                <div className="ball-trail" />
                <div className="floating-card hero-card-one">
                  <span>Найближчий слот</span>
                  <strong>18:00 - 19:00</strong>
                </div>
                <div className="floating-card hero-card-two">
                  <span>Kyiv</span>
                  <strong>{courts.length || 0} кортів поруч</strong>
                </div>
              </div>
            </aside>
          </section>
        ) : null}

        {view === "home" ? (
          <section className="content-section">
            <div className="section-heading compact-heading">
              <h2>Швидкий шлях до гри</h2>
            </div>
            <div className="steps-grid">
              {[
                ["01", "Корт", "Фільтр за містом, районом і покриттям."],
                ["02", "Тиждень", "Google Calendar-like сітка доступності."],
                ["03", "Бронь", "Summary, ціна і підтвердження."]
              ].map(([num, title, text]) => (
                <article className="step-card" key={num}>
                  <span>{num}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {view === "search" ? (
          <section className="product-layout">
            <div className="results-column">
              <div className="section-heading inline">
                <div>
                  <span className="eyebrow dark">Courts</span>
                  <h2>Обери корт</h2>
                </div>
              </div>

              <div className="filter-row">
                {["Поруч зі мною", "Indoor", "Open now", "4.5+ rating"].map((chip, index) => (
                  <button key={chip} className={index === 0 ? "chip active" : "chip"}>
                    {chip}
                  </button>
                ))}
              </div>

              <div className="court-list">
                {filteredCourts.map((court) => (
                  <article
                    className={court.id === activeCourt?.id ? "court-card active" : "court-card"}
                    key={court.id}
                    onMouseEnter={() => setActiveCourtId(court.id)}
                    onClick={() => selectCourt(court.id)}
                  >
                    <div className="court-image" style={{ background: court.image }} />
                    <div className="court-card-body">
                      <div>
                        <h3>{court.name}</h3>
                        <p>{court.address} - {court.district}</p>
                      </div>
                      <div className="meta-grid">
                        <span>{court.surface}</span>
                        <span>{court.rating} ★</span>
                        <span>{court.distance}</span>
                      </div>
                      <div className="court-card-footer">
                        <div>
                          <span className="caption">ціна</span>
                          <strong>{formatMoney(court.price_per_hour)} / h</strong>
                        </div>
                        <div>
                          <span className="caption">слот</span>
                          <strong>{court.nextSlot}</strong>
                        </div>
                        <button
                          className="primary-button small"
                          onClick={(event) => {
                            event.stopPropagation();
                            selectCourt(court.id);
                          }}
                        >
                          Обрати
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="map-panel">
              <div className="map-top">
                <div>
                  <span className="eyebrow dark">Мапа</span>
                  <h3>Карта кортів</h3>
                </div>
              </div>
              <div className="map-canvas">
                {filteredCourts.map((court, index) => (
                  <button
                    key={court.id}
                    className={court.id === activeCourt?.id ? `map-pin pin-${index + 1} active` : `map-pin pin-${index + 1}`}
                    onClick={() => selectCourt(court.id)}
                  >
                    {index + 1}
                  </button>
                ))}
                {activeCourt ? (
                  <div className="map-card">
                    <span>Обраний корт</span>
                    <strong>{activeCourt.name}</strong>
                    <small>{activeCourt.address}</small>
                  </div>
                ) : null}
              </div>
            </aside>
          </section>
        ) : null}

        {view === "detail" && activeCourt ? (
          <section className="detail-layout calendar-wide-layout">
            <div className="detail-main">
              <div className="detail-hero compact-court-hero" style={{ background: activeCourt.image }}>
                <div className="detail-title-card">
                  <span className="eyebrow dark">Корт</span>
                  <h1>{activeCourt.name}</h1>
                  <p>{activeCourt.address} - {activeCourt.city}, {activeCourt.district}</p>
                  <div className="meta-grid compact-meta">
                    <span>{activeCourt.rating} ★</span>
                    <span>{activeCourt.surface}</span>
                    <span>{formatMoney(activeCourt.price_per_hour)} / h</span>
                    <span>{activeCourt.opening_time} - {activeCourt.closing_time}</span>
                  </div>
                </div>
              </div>
            </div>

            <aside className="booking-summary">
              <span className="eyebrow dark">Бронювання</span>
              <h2>{activeCourt.name}</h2>
              <button className="primary-button full" onClick={() => setView("cabinet")}>
                Увійти для бронювання
              </button>
            </aside>
          </section>
        ) : null}

        {view === "cabinet" ? (
          <section className="content-section">
            {!isAuthed ? (
              <section className="auth-screen">
                <div className="auth-card">
                  <img src={logoUrl} alt="Courtly" className="auth-logo" />
                  <h2>{authMode === "signup" ? "Create an account" : "Sign in"}</h2>
                  <form className="auth-form" onSubmit={authMode === "signup" ? handleRegister : handleLogin}>
                    {authMode === "signup" ? (
                      <div className="auth-two-columns">
                        <label>
                          <span>First name</span>
                          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Vasya" required />
                        </label>
                        <label>
                          <span>Last name</span>
                          <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Pupkin" required />
                        </label>
                      </div>
                    ) : null}
                    <label>
                      <span>Email</span>
                      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="example@email.com" type="email" required />
                    </label>
                    <label>
                      <span>Password</span>
                      <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
                    </label>
                    {authMode === "signup" ? (
                      <>
                        <label>
                          <span>Confirm password</span>
                          <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" required />
                        </label>
                        <label className="terms-row">
                          <input
                            checked={acceptedTerms}
                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                            type="checkbox"
                          />
                          <span>I agree to the Privacy Policy and Terms of Service</span>
                        </label>
                      </>
                    ) : null}
                    <button className="primary-button full auth-submit" type="submit">
                      {authMode === "signup" ? "Sign up" : "Sign in"}
                    </button>
                  </form>
                  <button
                    className="auth-switch"
                    onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                    type="button"
                  >
                    {authMode === "signup" ? "Have an account? Sign in" : "No account? Sign up"}
                  </button>
                </div>
              </section>
            ) : (
              <>
                <div className="section-heading inline">
                  <div>
                    <span className="eyebrow dark">Акаунт</span>
                    <h2>Особистий кабінет</h2>
                  </div>
                  <div className="row-actions">
                    <button className="secondary-button" onClick={() => loadCabinet()} disabled={!isAuthed}>
                      Оновити
                    </button>
                    <button className="secondary-button" onClick={logout}>
                      Вийти
                    </button>
                  </div>
                </div>

                <div className="cabinet-grid">
                  <article className="profile-card">
                    <div className="avatar">{profile?.full_name?.slice(0, 1) || "C"}</div>
                    <h3>{profile?.full_name}</h3>
                    <p>{profile?.email}</p>
                    <div className="profile-meta">
                      <span>{profile?.role}</span>
                      <span>{favorites.length} favorites</span>
                    </div>
                  </article>

                  <article className="bookings-card">
                    <div className="segmented-tabs">
                      <button className="active">My bookings</button>
                      <button>Favorites</button>
                      <button>Reviews</button>
                    </div>
                    <div className="booking-list">
                      {bookings.length === 0 ? <div className="empty-state">Поки немає бронювань.</div> : null}
                      {bookings.map((booking) => (
                        <div className="booking-row" key={booking.id}>
                          <div>
                            <strong>{booking.court_name || activeCourt?.name || booking.court_id}</strong>
                            <span>{new Date(booking.starts_at).toLocaleString()} - {booking.status}</span>
                          </div>
                          <strong>{formatMoney(booking.total_price || selectedTotal)}</strong>
                          <button className="secondary-button compact" onClick={() => loadBookingDetail(booking.id)}>
                            Деталі
                          </button>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
                {/* Деталі бронювання рендеряться нижче... */}
              </>
              
            )}
          </section>
        ) : null}

        {view === "admin" && isManager ? (
          <section className="content-section admin-section">
            <div className="section-heading inline">
              <div>
                <span className="eyebrow dark">Дашборд</span>
                <h2>Admin control center</h2>
              </div>
              <button className="primary-button" onClick={refreshAdminAndCourts} disabled={!isAuthed}>
                Оновити
              </button>
            </div>

            <div className="admin-grid">
              <article className="metric-card">
                <span>Users</span>
                <strong>{adminUsers.length}</strong>
                <p>Без PII.</p>
              </article>
              <article className="metric-card">
                <span>Roles</span>
                <strong>{roles.length}</strong>
                <p>Ролі.</p>
              </article>
              <article className="metric-card">
                <span>Policies</span>
                <strong>{policies.length}</strong>
                <p>Політики.</p>
              </article>
              <article className="metric-card">
                <span>Bookings</span>
                <strong>{adminBookings.length}</strong>
                <p>Список броней.</p>
              </article>
              <article className="metric-card">
                <span>Courts</span>
                <strong>{courts.length}</strong>
                <p>Каталог.</p>
              </article>
            </div>

            <div className="admin-tabs">
              {[
                ["users", "Users"],
                ["roles", "Roles"],
                ["policies", "Policies"],
                ["courts", "Courts"],
                ["bookings", "Bookings"]
              ].map(([id, label]) => (
                <button key={id} className={adminTab === id ? "active" : ""} onClick={() => setAdminTab(id)}>
                  {label}
                </button>
              ))}
            </div>
            
            {/* UI керування Users, Roles, Policies відповідно до adminTab */}
          </section>
        ) : null}
      </main>
    </div>
  );
}