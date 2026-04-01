import { useRef, useState, useEffect, useMemo } from 'react'
import { MapPin, Clock, Layers2, Sun, Warehouse, Banknote } from 'lucide-react'
import './App.css'
import AuthForm from './AuthForm'
import { CourtsMap } from './CourtsMap.jsx'

const LOGO_SRC = '/courtly.png'
const HERO_BG_BW = '/image2.jpg'
const HOW_CARD_IMAGES = ['/image1.jpg', '/image2.jpg', '/image3.jpg']

/** Inline copy of /logo.svg — allows animating the lime mark separately */
function PreloaderLogo() {
  return (
    <svg
      className="preloader-logo"
      width="339"
      height="77"
      viewBox="0 0 339 77"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="preloader-logo__type"
        d="M61.376 45.368C61.376 48.44 60.416 51.064 58.496 53.24C56.576 55.416 53.5467 57.08 49.408 58.232C45.2693 59.384 39.8933 59.96 33.28 59.96C26.6667 59.96 21.0347 59.4267 16.384 58.36C11.776 57.2933 8.256 55.544 5.824 53.112C3.43467 50.68 2.24 47.4373 2.24 43.384C2.24 39.3307 3.43467 36.088 5.824 33.656C8.256 31.1813 11.776 29.4107 16.384 28.344C21.0347 27.2347 26.6667 26.68 33.28 26.68C39.8933 26.68 45.248 27.256 49.344 28.408C53.44 29.56 56.448 31.224 58.368 33.4C60.288 35.576 61.2693 38.1787 61.312 41.208H47.232C46.5493 39.544 45.0133 38.264 42.624 37.368C40.2347 36.4293 37.12 35.96 33.28 35.96C30.1653 35.96 27.456 36.1947 25.152 36.664C22.848 37.0907 21.056 37.8373 19.776 38.904C18.5387 39.9707 17.92 41.464 17.92 43.384C17.92 45.2613 18.5387 46.7333 19.776 47.8C21.0133 48.8667 22.784 49.6133 25.088 50.04C27.392 50.4667 30.1227 50.68 33.28 50.68C37.12 50.68 40.2347 50.232 42.624 49.336C45.056 48.3973 46.6133 47.0747 47.296 45.368H61.376Z"
        fill="white"
      />
      <path
        className="preloader-logo__type"
        d="M175.992 59H160.632V27.64H175.992V59ZM161.272 42.808L161.4 45.88C161.272 46.776 160.845 47.8213 160.12 49.016C159.437 50.2107 158.477 51.448 157.24 52.728C156.003 54.008 154.488 55.2027 152.696 56.312C150.904 57.3787 148.856 58.2533 146.552 58.936C144.248 59.6187 141.688 59.96 138.872 59.96C136.056 59.96 133.389 59.6613 130.872 59.064C128.355 58.5093 126.115 57.5707 124.152 56.248C122.189 54.9253 120.653 53.1547 119.544 50.936C118.435 48.6747 117.88 45.8587 117.88 42.488V27.64H133.24V40.888C133.24 43.2347 133.624 45.048 134.392 46.328C135.203 47.608 136.461 48.504 138.168 49.016C139.875 49.4853 142.072 49.72 144.76 49.72C147.277 49.72 149.603 49.3573 151.736 48.632C153.912 47.864 155.811 46.9467 157.432 45.88C159.096 44.8133 160.376 43.7893 161.272 42.808ZM181.755 27.64H197.115V59H181.755V27.64ZM213.627 39.48C210.854 39.48 208.315 39.736 206.011 40.248C203.707 40.76 201.744 41.3787 200.123 42.104C198.502 42.7867 197.286 43.4693 196.475 44.152L196.347 41.08C196.475 40.184 196.816 39.1387 197.371 37.944C197.926 36.7067 198.672 35.448 199.611 34.168C200.55 32.8453 201.702 31.6293 203.067 30.52C204.432 29.368 205.99 28.4507 207.739 27.768C209.531 27.0427 211.494 26.68 213.627 26.68V39.48ZM216.843 27.64H254.475V37.24H216.843V27.64ZM227.979 18.04H243.339V59H227.979V18.04ZM259.59 14.84H274.95V59H259.59V14.84ZM279.133 27.64H295.453L314.141 57.72L300.893 59L279.133 27.64ZM338.013 27.64L306.845 71.8H291.165L304.541 53.688L321.693 27.64H338.013Z"
        fill="white"
      />
      <g className="preloader-logo__ball-wrap">
        <path
          d="M100.751 19.8803C105.588 22.5488 108.991 26.6758 110.713 31.3432C104.477 32.4561 98.7672 36.0639 95.3463 41.7258C91.9256 47.3872 91.5118 53.9148 93.6209 59.6319C88.5293 60.5407 83.087 59.7897 78.2494 57.121C73.4119 54.4521 70.0101 50.3242 68.288 45.6563C74.524 44.543 80.2335 40.9369 83.6541 35.2755C87.075 29.6138 87.4901 23.0849 85.3806 17.3676C90.4718 16.4591 95.9138 17.2118 100.751 19.8803ZM81.0557 18.5748C82.8381 23.2014 82.5382 28.522 79.7568 33.1254C76.9756 37.7283 72.3036 40.6352 67.2197 41.4738C66.5466 36.8911 67.4042 32.0684 70.0133 27.7502C72.6228 23.4315 76.5651 20.309 81.0557 18.5748ZM111.78 35.5247C112.454 40.1082 111.597 44.932 108.987 49.2511C106.378 53.5697 102.434 56.6893 97.9439 58.4236C96.1627 53.7976 96.4628 48.4783 99.2436 43.8758C102.025 39.2729 106.696 36.3634 111.78 35.5247Z"
          fill="#C8DF2A"
        />
      </g>
    </svg>
  )
}

/** Mock courts — lngLat = [longitude, latitude] for Mapbox */
const MOCK_COURTS = [
  {
    id: 'c1',
    name: 'Clay Court #1',
    city: 'Lviv',
    district: 'Center',
    surface: 'Clay',
    outdoor: true,
    price: 250,
    hours: '8:00 – 22:00',
    image: '/image1.jpg',
    lngLat: [24.0228, 49.8352],
  },
  {
    id: 'c2',
    name: 'Hard #3 Sykhiv',
    city: 'Lviv',
    district: 'Sykhiv',
    surface: 'Hard',
    outdoor: true,
    price: 220,
    hours: '7:00 – 23:00',
    image: '/image2.jpg',
    lngLat: [24.0492, 49.8065],
  },
  {
    id: 'c3',
    name: 'Indoor Arena',
    city: 'Lviv',
    district: 'Center',
    surface: 'Hard',
    outdoor: false,
    price: 380,
    hours: '6:00 – 24:00',
    image: '/image3.jpg',
    lngLat: [24.0315, 49.8411],
  },
  {
    id: 'c4',
    name: 'Riverside Clay',
    city: 'Kyiv',
    district: 'Podil',
    surface: 'Clay',
    outdoor: true,
    price: 300,
    hours: '8:00 – 21:00',
    image: '/image1.jpg',
    lngLat: [30.5241, 50.4584],
  },
  {
    id: 'c5',
    name: 'Obolon Hard',
    city: 'Kyiv',
    district: 'Obolon',
    surface: 'Hard',
    outdoor: true,
    price: 240,
    hours: '8:00 – 22:00',
    image: '/image2.jpg',
    lngLat: [30.4963, 50.4986],
  },
  {
    id: 'c6',
    name: 'Saltivka Courts',
    city: 'Kharkiv',
    district: 'North',
    surface: 'Clay',
    outdoor: true,
    price: 200,
    hours: '8:00 – 20:00',
    image: '/image3.jpg',
    lngLat: [36.2308, 49.9935],
  },
]

function ReadyDropdown({ label, valueLabel, isOpen, onToggle, options, onSelect, currentValue }) {
  return (
    <div className={`ready-dropdown ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="ready-dropdown__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="ready-dropdown__label">{label}</span>
        <span className="ready-dropdown__value">{valueLabel}</span>
        <span className="ready-dropdown__chev" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="ready-dropdown__menu" role="listbox">
          {options.map((opt) => (
            <li key={String(opt.value)}>
              <button
                type="button"
                role="option"
                aria-selected={currentValue === opt.value}
                className={`ready-dropdown__option ${currentValue === opt.value ? 'is-active' : ''}`}
                onClick={() => onSelect(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReadyToPlaySection({ onBook, sectionRef }) {
  const [city, setCity] = useState('Lviv')
  const [district, setDistrict] = useState('All')
  const [courtId, setCourtId] = useState('c1')
  const [openMenu, setOpenMenu] = useState(null)
  const filtersRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', close, true)
    return () => document.removeEventListener('pointerdown', close, true)
  }, [])

  const cityOptions = useMemo(
    () => ['All', ...Array.from(new Set(MOCK_COURTS.map((c) => c.city)))],
    []
  )

  const districtOptions = useMemo(() => {
    const base = city === 'All' ? MOCK_COURTS : MOCK_COURTS.filter((c) => c.city === city)
    return ['All', ...Array.from(new Set(base.map((c) => c.district)))]
  }, [city])

  const filteredCourts = useMemo(() => {
    let list = MOCK_COURTS
    if (city !== 'All') list = list.filter((c) => c.city === city)
    if (district !== 'All') list = list.filter((c) => c.district === district)
    return list
  }, [city, district])

  useEffect(() => {
    if (!filteredCourts.length) return
    if (!filteredCourts.some((c) => c.id === courtId)) {
      setCourtId(filteredCourts[0].id)
    }
  }, [filteredCourts, courtId])

  const selected = filteredCourts.find((c) => c.id === courtId) ?? filteredCourts[0]

  const cityLabel = (v) => (v === 'All' ? 'All cities' : v)
  const districtLabel = (v) => (v === 'All' ? 'All areas' : v)

  const toggle = (key) => setOpenMenu((k) => (k === key ? null : key))

  return (
    <section className="page-snap ready-section" ref={sectionRef}>
      <div className="ready-shell">
        <header className="ready-head" data-animate data-delay="0">
          <h2 className="ready-title">READY TO PLAY?</h2>
        </header>

        <div className="ready-filters" ref={filtersRef} data-animate data-delay="1">
          <ReadyDropdown
            label="City"
            valueLabel={cityLabel(city)}
            isOpen={openMenu === 'city'}
            onToggle={() => toggle('city')}
            currentValue={city}
            options={cityOptions.map((v) => ({ value: v, label: cityLabel(v) }))}
            onSelect={(v) => {
              setCity(v)
              setDistrict('All')
              setOpenMenu(null)
            }}
          />
          <ReadyDropdown
            label="District"
            valueLabel={districtLabel(district)}
            isOpen={openMenu === 'district'}
            onToggle={() => toggle('district')}
            currentValue={district}
            options={districtOptions.map((v) => ({ value: v, label: districtLabel(v) }))}
            onSelect={(v) => {
              setDistrict(v)
              setOpenMenu(null)
            }}
          />
          <ReadyDropdown
            label="Court"
            valueLabel={selected?.name ?? '—'}
            isOpen={openMenu === 'court'}
            onToggle={() => toggle('court')}
            currentValue={courtId}
            options={filteredCourts.map((c) => ({ value: c.id, label: c.name }))}
            onSelect={(v) => {
              setCourtId(v)
              setOpenMenu(null)
            }}
          />
        </div>

        <div className="ready-grid" data-animate data-delay="2">
          {selected ? (
            <article className="ready-card">
              <div className="ready-card__media">
                <img className="ready-card__image" src={selected.image} alt="" decoding="async" />
              </div>
              <div className="ready-card__body">
                <h3 className="ready-card__title">{selected.name}</h3>
                <ul className="ready-card__facts">
                  <li className="ready-card__fact">
                    <span className="ready-card__ico" aria-hidden="true">
                      <MapPin size={22} strokeWidth={1.65} />
                    </span>
                    <span className="ready-card__fact-text">
                      <span className="ready-card__fact-label">Location</span>
                      <span className="ready-card__fact-value">
                        {selected.city} · {selected.district}
                      </span>
                    </span>
                  </li>
                  <li className="ready-card__fact">
                    <span className="ready-card__ico" aria-hidden="true">
                      <Clock size={22} strokeWidth={1.65} />
                    </span>
                    <span className="ready-card__fact-text">
                      <span className="ready-card__fact-label">Hours</span>
                      <span className="ready-card__fact-value">{selected.hours}</span>
                    </span>
                  </li>
                  <li className="ready-card__fact">
                    <span className="ready-card__ico" aria-hidden="true">
                      <Layers2 size={22} strokeWidth={1.65} />
                    </span>
                    <span className="ready-card__fact-text">
                      <span className="ready-card__fact-label">Surface</span>
                      <span className="ready-card__fact-value">{selected.surface}</span>
                    </span>
                  </li>
                  <li className="ready-card__fact">
                    <span className="ready-card__ico" aria-hidden="true">
                      {selected.outdoor ? (
                        <Sun size={22} strokeWidth={1.65} />
                      ) : (
                        <Warehouse size={22} strokeWidth={1.65} />
                      )}
                    </span>
                    <span className="ready-card__fact-text">
                      <span className="ready-card__fact-label">Type</span>
                      <span className="ready-card__fact-value">
                        {selected.outdoor ? 'Outdoor' : 'Indoor'}
                      </span>
                    </span>
                  </li>
                </ul>
                <div className="ready-card__price" aria-label="Price per hour">
                  <span className="ready-card__ico ready-card__ico--lime" aria-hidden="true">
                    <Banknote size={22} strokeWidth={1.65} />
                  </span>
                  <div className="ready-card__price-text">
                    <span className="ready-card__fact-label">From</span>
                    <span className="ready-card__price-value">
                      {selected.price}{' '}
                      <span className="ready-card__currency">UAH</span>
                      <span className="ready-card__price-unit">/ hr</span>
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" className="ready-card__book" onClick={onBook}>
                <span>BOOK</span>
                <span className="ready-card__book-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M7 17 17 7" />
                    <path d="M9 7h8v8" />
                  </svg>
                </span>
              </button>
            </article>
          ) : (
            <div className="ready-card ready-card--empty">No courts match these filters.</div>
          )}

          <div className="ready-map">
            <div className="ready-map__frame">
              <CourtsMap courts={filteredCourts} selectedId={courtId} onSelectCourt={setCourtId} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Logo({ inBadge = false }) {
  return (
    <div className={inBadge ? 'logo logo--badge' : 'logo'} aria-label="courtly logo">
      <img className="logo__image" src={LOGO_SRC} alt="Courtly" />
    </div>
  )
}

function SiteFooter({ variant = '' }) {
  return (
    <footer className={`site-footer${variant ? ` site-footer--${variant}` : ''}`}>
      <p className="site-footer__text">© 2026 Team 1.</p>
    </footer>
  )
}

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [preloaderMounted, setPreloaderMounted] = useState(true)

  const snapContainerRef = useRef(null)
  const howItWorksRef = useRef(null)
  const readyToPlayRef = useRef(null)
  const cursorFxRef = useRef(null)
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)

  useEffect(() => {
    const container = snapContainerRef.current
    if (!container) return
    const els = container.querySelectorAll('[data-animate]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, root: container }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [showAuth, user])

  useEffect(() => {
    // Preload section card images to avoid first-hover decode jank.
    HOW_CARD_IMAGES.forEach((src) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
    })
  }, [])

  useEffect(() => {
    const minMs = 850
    const start = performance.now()
    const arm = () => {
      const elapsed = performance.now() - start
      window.setTimeout(() => setPreloaderDone(true), Math.max(0, minMs - elapsed))
    }
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })
  }, [])

  useEffect(() => {
    const fx = cursorFxRef.current
    const dot = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!fx || !dot || !ring) return
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let dotX = mouseX
    let dotY = mouseY
    let ringX = mouseX
    let ringY = mouseY
    let prevMouseX = mouseX
    let prevMouseY = mouseY
    let dotRotation = 0
    let spinVelocity = 0
    let rafId = 0

    const INTERACTIVE_SEL =
      'button, a, [role="button"], .how-step, .ready-dropdown__trigger, .ready-card__book, .ready-map-marker'
    const TEXT_SEL = 'input, textarea, [contenteditable="true"]'

    const setModeFromTarget = (target) => {
      if (!(target instanceof Element)) return
      fx.classList.toggle('is-hover', Boolean(target.closest(INTERACTIVE_SEL)))
      fx.classList.toggle('is-text', Boolean(target.closest(TEXT_SEL)))
    }

    const onPointerMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      fx.classList.remove('is-hidden')
      setModeFromTarget(e.target)
    }

    const onPointerDown = () => fx.classList.add('is-press')
    const onPointerUp = () => fx.classList.remove('is-press')
    const onLeave = () => fx.classList.add('is-hidden')
    const onEnter = () => fx.classList.remove('is-hidden')

    const animate = () => {
      dotX += (mouseX - dotX) * 0.35
      dotY += (mouseY - dotY) * 0.35
      ringX += (mouseX - ringX) * 0.24
      ringY += (mouseY - ringY) * 0.24

      const dx = mouseX - prevMouseX
      const dy = mouseY - prevMouseY
      const speed = Math.min(Math.hypot(dx, dy), 28)
      if (speed > 0.05) {
        const direction = dx >= 0 ? 1 : -1
        spinVelocity += direction * speed * 0.26
      }
      spinVelocity *= 0.9
      dotRotation += spinVelocity
      prevMouseX = mouseX
      prevMouseY = mouseY

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) rotate(${dotRotation.toFixed(2)}deg) scale(var(--cursor-dot-scale, 1))`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mouseenter', onEnter)
    }
  }, [showAuth, user])

  const scrollToSection = (ref) => {
    if (ref?.current && snapContainerRef?.current) {
      snapContainerRef.current.scrollTo({
        top: ref.current.offsetTop,
        behavior: 'smooth',
      })
    }
  }

  return (
    <main className="app">
      {preloaderMounted && (
        <div
          className={`page-preloader ${preloaderDone ? 'page-preloader--done' : ''}`}
          aria-busy={!preloaderDone}
          aria-label="Loading"
          onTransitionEnd={(e) => {
            if (e.propertyName === 'opacity' && preloaderDone) setPreloaderMounted(false)
          }}
        >
          <div className="page-preloader__inner">
            <PreloaderLogo />
          </div>
        </div>
      )}

      <div className="cursor-fx is-hidden" ref={cursorFxRef} aria-hidden="true">
        <div className="cursor-fx__ring" ref={cursorRingRef} />
        <div className="cursor-fx__dot" ref={cursorDotRef} />
      </div>

      {!showAuth && !user && (
        <div className="landing-snap" ref={snapContainerRef}>
          <section className="hero page-snap hero--snap">
            <div className="hero__card">
              <div className="hero__badge">
                <Logo inBadge />
              </div>

              <div className="court">
                <img
                  className="court__image"
                  src={HERO_BG_BW}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority="high"
                />
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
                    <span>VIEW COURTS</span>
                    <span className="hero__icon-box" aria-hidden="true">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17 17 7" />
                        <path d="M9 7h8v8" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="hero__btn hero__btn--dark"
                    onClick={() => scrollToSection(howItWorksRef)}
                  >
                    HOW IT WORKS
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-scroll-indicator hero-scroll-indicator--outside" aria-hidden="true">
              <div className="hero-scroll-mouse">
                <span className="hero-scroll-wheel" />
              </div>
            </div>
          </section>

          <section className="page-snap how-section" ref={howItWorksRef}>
            <div className="how-section__inner">
              <div className="how-section__head" data-animate data-delay="0">
                <p className="how-section__eyebrow">The Process</p>
                <h2 className="how-section__title">
                  HOW IT<br />WORKS
                </h2>
              </div>
              <div className="how-steps">
                <div className="how-step" data-animate data-delay="1">
                  <div className="how-step__header">
                    <div className="how-step__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    </div>
                    <span className="how-step__num">01</span>
                  </div>
                  <h3 className="how-step__name">Find</h3>
                  <p className="how-step__desc">
                    Browse available courts by location, surface type, and time slot that fits your schedule.
                  </p>
                </div>

                <div className="how-step" data-animate data-delay="2">
                  <div className="how-step__header">
                    <div className="how-step__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <span className="how-step__num">02</span>
                  </div>
                  <h3 className="how-step__name">Book</h3>
                  <p className="how-step__desc">
                    Reserve your slot in seconds. Instant confirmation sent directly to you, no back-and-forth.
                  </p>
                </div>

                <div className="how-step" data-animate data-delay="3">
                  <div className="how-step__header">
                    <div className="how-step__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <span className="how-step__num">03</span>
                  </div>
                  <h3 className="how-step__name">Play</h3>
                  <p className="how-step__desc">
                    Show up and enjoy the game. The court is ready and waiting — just bring your racket.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <ReadyToPlaySection sectionRef={readyToPlayRef} onBook={() => setShowAuth(true)} />
          <SiteFooter />
        </div>
      )}

      {showAuth && !user && (
        <section className="auth-page">
          <div className="auth-page__inner">
            <div className="auth-page__header">
              <button
                type="button"
                className="auth-back"
                onClick={() => setShowAuth(false)}
                aria-label="Back to home"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              <Logo />
            </div>

            <AuthForm onLoginSuccess={(userData) => setUser(userData)} />
            <SiteFooter variant="auth" />
          </div>
        </section>
      )}

      {user && (
        <section className="auth-page">
          <div className="auth-page__inner">
            <Logo />
            <div className="auth-card">
              <div className="user-avatar" aria-hidden="true">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              <h2 className="auth-card__title">
                {user.first_name} {user.last_name}
              </h2>
              <p className="auth-card__email">{user.email}</p>
              <p className="auth-card__logged">
                Signed in as <span className="auth-card__role">{user.role}</span>
              </p>

              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setUser(null)
                  setShowAuth(false)
                }}
              >
                Sign out
              </button>
            </div>
            <SiteFooter variant="auth" />
          </div>
        </section>
      )}
    </main>
  )
}

export default App
