import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

/** Same path as baseball-fill (1).svg — inline for lime `currentColor` */
const BALL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M17.0004 3.33975C19.1501 4.58086 20.6625 6.50032 21.4279 8.67109C18.6563 9.18869 16.1188 10.8667 14.5985 13.5C13.0783 16.1331 12.8944 19.1691 13.8317 21.8281C11.5689 22.2508 9.15027 21.9015 7.0004 20.6603C4.85053 19.419 3.33869 17.4991 2.57338 15.3281C5.34477 14.8103 7.88213 13.1331 9.40232 10.5C10.9226 7.86675 11.1071 4.83019 10.1696 2.17109C12.4322 1.74854 14.8507 2.09864 17.0004 3.33975ZM8.24755 2.73256C9.03965 4.88437 8.90639 7.35899 7.67027 9.50001C6.43427 11.6408 4.35796 12.9928 2.09862 13.3828C1.79947 11.2514 2.18061 9.00838 3.34015 7.00001C4.49982 4.99139 6.25184 3.53912 8.24755 2.73256ZM21.9018 10.6159C22.2013 12.7477 21.8204 14.9912 20.6607 17C19.501 19.0086 17.7485 20.4595 15.7529 21.2661C14.9613 19.1146 15.0947 16.6406 16.3305 14.5C17.5665 12.3592 19.6425 11.006 21.9018 10.6159Z"/></svg>'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const MAPBOX_STYLE = 'mapbox://styles/yallwannasingle/cmlwdrlha002001sf44dh91zo'

mapboxgl.accessToken = MAPBOX_TOKEN

const LVIV_CENTER = [24.0316, 49.842]

/**
 * @param {{ id: string, name: string, lngLat: [number, number] }[]} courts
 */
export function CourtsMap({ courts, selectedId, onSelectCourt }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const boundsKeyRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: LVIV_CENTER,
      zoom: 12,
      attributionControl: true,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      setMapReady(true)
      map.resize()
    })

    const ro = new ResizeObserver(() => {
      map.resize()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    for (const c of courts) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = `ready-map-marker${c.id === selectedId ? ' is-active' : ''}`
      el.setAttribute('aria-label', `Select ${c.name}`)

      const ball = document.createElement('span')
      ball.className = 'ready-map-marker__ball'
      ball.innerHTML = BALL_SVG

      const caption = document.createElement('span')
      caption.className = 'ready-map-marker__label'
      caption.textContent = c.name

      el.appendChild(ball)
      el.appendChild(caption)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        el.focus({ preventScroll: true })
        onSelectCourt(c.id)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(c.lngLat)
        .addTo(map)
      markersRef.current.push(marker)
    }

    if (courts.length === 0) return

    const sortedKey = [...courts.map((c) => c.id)].sort().join('|')
    if (sortedKey !== boundsKeyRef.current) {
      boundsKeyRef.current = sortedKey
      const b = new mapboxgl.LngLatBounds(courts[0].lngLat, courts[0].lngLat)
      courts.forEach((c) => b.extend(c.lngLat))
      map.fitBounds(b, { padding: 72, maxZoom: 14, duration: 600 })
    } else {
      const sel = courts.find((c) => c.id === selectedId)
      if (sel) {
        map.easeTo({ center: sel.lngLat, duration: 420 })
      }
    }
  }, [mapReady, courts, selectedId, onSelectCourt])

  return <div ref={containerRef} className="ready-map__canvas ready-map__mapbox" />
}
