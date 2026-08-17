import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { ShapeGeometry } from 'three'
import { OrangeGeometricBackground } from './ui/OrangeGeometricBackground.tsx'

interface Props {
  onEnter: () => void
  onQuizz: () => void
  theme?: 'light' | 'dark'
}

export default function LandingPage({ onEnter, onQuizz, theme = 'dark' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardTlRef = useRef<HTMLDivElement>(null)
  const cardBrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0.15, 6.8)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      // WebGL not available — skip 3D animation gracefully
      return
    }
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.65

    const cluster = new THREE.Group()
    scene.add(cluster)

    // Mouse interaction state
    let mouseX = 0
    let mouseY = 0
    let targetRotX = 0
    let targetRotY = 0

    // Mouse move handler
    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX = x * 2 - 1
      mouseY = y * 2 - 1
      // Target rotation: up/down = X, left/right = Y
      targetRotX = mouseY * 0.25
      targetRotY = mouseX * 0.45
    }
    canvas.addEventListener('pointermove', handlePointerMove)

    // Theme-specific colors
    const isLight = theme === 'light'
    const bgColor = isLight ? 0xffffff : 0x040009

    // Vibrant and highly saturated colors for light mode
    const emissivePalette = isLight
      ? [0xff0055, 0xff5500, 0xffaa00, 0x00cc44, 0x0077ff, 0xaa00ff]
      : [0xFF1C74, 0xCC0055, 0xFF00BB, 0xAA00DD, 0xFF4499, 0xDD0088]

    const edgeColor = isLight ? 0x000000 : 0xFF5599
    const textColor = isLight ? 0x111827 : 0xffffff

    const mkMat = (emissive: number, opacity: number) =>
      new THREE.MeshPhysicalMaterial({
        color: isLight ? 0x000000 : bgColor,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: isLight ? 1.5 : 0.9,
        metalness: isLight ? 0.2 : 0.88,
        roughness: isLight ? 0.1 : 0.06,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      })

    const mats = emissivePalette.map((c, i) => mkMat(c, 0.75 + (i % 3) * 0.05))

    const edgeBaseMat = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: isLight ? 0.6 : 0.48 })

    const defs: Array<[[number, number, number], [number, number, number], [number, number, number]]> = [
      [[1.44, 2.04, 0.88], [0.00, 0.00, 0.00], [0.00, 0.00, 0.00]],
      [[1.02, 1.52, 0.82], [-0.92, 0.44, -0.50], [0.05, 0.28, 0.08]],
      [[1.18, 0.88, 1.02], [0.88, -0.52, 0.30], [0.10, -0.22, 0.05]],
      [[0.68, 0.68, 0.68], [0.26, 1.28, 0.55], [-0.18, 0.42, 0.28]],
      [[0.82, 0.62, 0.74], [-0.58, -1.12, 0.24], [0.12, 0.18, -0.22]],
      [[0.52, 1.08, 0.62], [1.06, 0.82, -0.56], [0.22, -0.32, 0.10]],
      [[0.56, 0.46, 0.40], [-0.19, -0.46, 0.88], [-0.10, 0.52, 0.18]],
      [[0.50, 0.40, 0.50], [0.54, -1.38, -0.32], [0.32, 0.22, -0.10]],
      [[0.40, 0.84, 0.50], [-1.24, -0.30, 0.14], [0.10, 0.30, 0.18]],
      [[0.30, 0.30, 0.30], [0.84, 1.58, 0.32], [0.38, 0.12, 0.30]],
      [[0.60, 0.30, 0.80], [-0.44, 1.58, -0.22], [0.22, -0.38, 0.12]],
      [[0.34, 0.60, 0.34], [1.34, -0.08, 0.54], [-0.12, 0.58, 0.22]],
    ]

    // Lettres à afficher sur les 4 premiers cubes
    const letters = ['F', 'C', 'T', 'D'];
    const fontSize = 0.6;
    let font: Font | null = null;
    const letterMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x111827 : 0xffffff,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    // Charger la police de caractères de base Three.js (helvetiker)
    new FontLoader().load('https://cdn.jsdelivr.net/npm/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json', loadedFont => {
      font = loadedFont
      // On doit attendre la police pour ajouter les lettres, donc on retire et on remet les 4 premiers cubes
      for (let i = 0; i < 4; i++) {
        const [size, pos, rot] = defs[i]
        const geo = new THREE.BoxGeometry(...size)
        const mesh = new THREE.Mesh(geo, mats[i % mats.length])
        mesh.position.set(...pos)
        mesh.rotation.set(...rot)
        // Ajout de la lettre
        // Utilise ShapeGeometry pour un vrai rendu 2D plat
        const shapes = font.generateShapes(letters[i], fontSize)
        const textGeo = new ShapeGeometry(shapes)
        textGeo.center()
        const textMat = letterMat;
        const textMesh = new THREE.Mesh(textGeo, textMat)
        // Colle la lettre à la face avant du cube, parfaitement plat
        textMesh.position.set(0, 0, size[2] / 2 + 0.001)
        mesh.add(textMesh)
        cluster.add(mesh)

        const em = edgeBaseMat.clone()
        em.opacity = 0.28 + (i % 4) * 0.08
        const eg = new THREE.EdgesGeometry(geo)
        const seg = new THREE.LineSegments(eg, em)
        seg.position.copy(mesh.position)
        seg.rotation.copy(mesh.rotation)
        cluster.add(seg)
      }
      // Les autres cubes (sans lettre)
      for (let i = 4; i < defs.length; i++) {
        const [size, pos, rot] = defs[i]
        const geo = new THREE.BoxGeometry(...size)
        const mesh = new THREE.Mesh(geo, mats[i % mats.length])
        mesh.position.set(...pos)
        mesh.rotation.set(...rot)
        cluster.add(mesh)

        const em = edgeBaseMat.clone()
        em.opacity = 0.28 + (i % 4) * 0.08
        const eg = new THREE.EdgesGeometry(geo)
        const seg = new THREE.LineSegments(eg, em)
        seg.position.copy(mesh.position)
        seg.rotation.copy(mesh.rotation)
        cluster.add(seg)
      }
    })

    const lightDefs: Array<[number, number, number, [number, number, number]]> = isLight ? [
      [0xffffff, 8, 20, [0.0, 0.0, 4.0]],
      [0xffb3ba, 5, 16, [3.5, 2.0, 0.0]],
      [0xbae1ff, 4, 14, [-3.5, -1.0, 0.0]],
    ] : [
      [0xFF1C74, 12, 20, [0.0, 0.0, 4.0]],
      [0xFF00CC, 8, 16, [3.5, 2.0, 0.0]],
      [0x8800BB, 6, 14, [-3.5, -1.0, 0.0]],
      [0xFF6699, 7, 14, [0.0, 4.0, 2.0]],
      [0xCC0044, 5, 12, [0.0, -3.5, 2.0]],
      [0xFFAACC, 3, 10, [-2.0, 2.5, 2.5]],
    ]

    lightDefs.forEach(([color, intensity, dist, p]) => {
      const light = new THREE.PointLight(color, intensity, dist)
      light.position.set(...p)
      scene.add(light)
    })
    scene.add(new THREE.AmbientLight(isLight ? 0xffffff : 0x0D000A, isLight ? 1.0 : 1.5))


    let t = 0
    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      t += 0.060
      // Interpolation douce vers la cible souris
      cluster.rotation.y += ((t * 0.32 + targetRotY) - cluster.rotation.y) * 0.08
      cluster.rotation.x += ((Math.sin(t * 0.21) * 0.11 + targetRotX) - cluster.rotation.x) * 0.08
      cluster.rotation.z += ((Math.sin(t * 0.14) * 0.04) - cluster.rotation.z) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    const t1 = setTimeout(() => cardTlRef.current?.classList.add('lp-card-show'), 700)
    const t2 = setTimeout(() => cardBrRef.current?.classList.add('lp-card-show'), 980)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointermove', handlePointerMove)
      clearTimeout(t1)
      clearTimeout(t2)
      renderer.dispose()
    }
  }, [theme])

  const isLight = theme === 'light'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: isLight
        ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
        : 'linear-gradient(135deg, #1a0022 0%, #2a0033 40%, #3a0055 80%, #FF1C74 100%)',
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden',
    }}>
      <OrangeGeometricBackground />
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .lp-card { opacity: 0; }
        .lp-card-show {
          animation:
            lp-cardIn  0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            lp-floatY  7.0s ease-in-out 0.85s infinite;
        }
        .lp-card-br.lp-card-show {
          animation:
            lp-cardIn  0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            lp-floatY  9.5s ease-in-out 0.85s infinite;
        }
        @keyframes lp-cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes lp-slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-ripple {
          0%  { box-shadow: 0 0 0 0   rgba(255,28,116,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(255,28,116,0); }
          100%{ box-shadow: 0 0 0 0   rgba(255,28,116,0); }
        }
        .lp-hero-left  { animation: lp-slideUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .lp-hero-right { animation: lp-slideUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .lp-badge-dot  { animation: lp-ripple 2.2s ease-out infinite; }

        .lp-launch-btn:hover { box-shadow: 0 0 34px rgba(255,28,116,0.58); transform: translateY(-1px); }
        .lp-buy-btn:hover    { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(255,28,116,0.42), 0 12px 40px rgba(204,0,85,0.58), inset 0 1px 0 rgba(255,255,255,0.18); }
        .lp-nav-link:hover   { color: #F2EAF6; }

        /* Animated Badge: Fait par vos collègues de Gennevilliers */
        @keyframes lpShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lpFloatBanner {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes lpGlowRing {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 149, 0, 0.4), 0 0 45px rgba(255, 28, 116, 0.25), inset 0 0 15px rgba(255, 255, 255, 0.15);
          }
          50% {
            box-shadow: 0 0 35px rgba(255, 149, 0, 0.75), 0 0 70px rgba(255, 28, 116, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.3);
          }
        }
        @keyframes lpDotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        .lp-collegues-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 22px;
          border-radius: 100px;
          background: ${isLight
            ? 'rgba(255, 255, 255, 0.88)'
            : 'rgba(12, 2, 22, 0.82)'};
          backdrop-filter: blur(20px) saturate(180%);
          border: 1.5px solid ${isLight
            ? 'rgba(245, 158, 11, 0.6)'
            : 'rgba(255, 149, 0, 0.7)'};
          animation: lpFloatBanner 4.5s ease-in-out infinite, lpGlowRing 3s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .lp-collegues-badge:hover {
          transform: scale(1.06) translateY(-4px) !important;
          border-color: #ff1c74;
        }

        .lp-badge-dot-live {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff1c74;
          box-shadow: 0 0 10px #ff1c74;
          animation: lpDotPulse 1.8s infinite ease-in-out;
        }

        .lp-badge-icon, .lp-badge-sparkle {
          font-size: 16px;
          filter: drop-shadow(0 0 6px rgba(255, 149, 0, 0.6));
        }

        .lp-badge-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(11px, 2.5vw, 15px);
          letter-spacing: 0.05em;
          background: linear-gradient(
            90deg,
            #ff9500 0%,
            #ff1c74 25%,
            #ffaa00 50%,
            #ff1c74 75%,
            #ff9500 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lpShimmer 3.5s linear infinite;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      {/* Canvas Three.js */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Edge line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: isLight
          ? 'linear-gradient(90deg, transparent, rgba(244,114,182,0.3) 30%, rgba(244,114,182,0.3) 70%, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,28,116,0.22) 30%, rgba(255,28,116,0.22) 70%, transparent)',
        zIndex: 100, pointerEvents: 'none',
      }} />

      {/* Bottom Center Animated Badge: Fait par vos collègues de Gennevilliers */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(18px, 4vh, 32px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}>
        <div className="lp-collegues-badge">
          <span className="lp-badge-dot-live" />
          <span className="lp-badge-icon">🏛️</span>
          <span className="lp-badge-text">Fait par vos collègues de Gennevilliers</span>
          <span className="lp-badge-sparkle">✨</span>
        </div>
      </div>

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(ellipse at center, rgba(253,164,175,0.4) 0%, rgba(186,230,253,0.2) 42%, transparent 68%)'
          : 'radial-gradient(ellipse at center, rgba(200,0,100,0.20) 0%, rgba(110,0,160,0.09) 42%, transparent 68%)',
        filter: 'blur(18px)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Grid */}
      <div style={{
        display: isLight ? 'none' : 'block',
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,28,116,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,28,116,0.028) 1px, transparent 1px)',
        backgroundSize: '70px 70px',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 44px',
        background: isLight ? 'rgba(255,255,255,0.62)' : 'rgba(2,1,4,0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,28,116,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(14px, 4vw, 17px)', letterSpacing: '0.03em', color: isLight ? '#334155' : '#F2EAF6' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 10px rgba(255,28,116,0.85))' }}>
            <path d="M14 2L2 10L14 26L26 10L14 2Z" fill={isLight ? "rgba(244,114,182,0.2)" : "rgba(255,28,116,0.14)"} stroke={isLight ? "#ec4899" : "#FF1C74"} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M14 2L9 10L14 26L19 10L14 2Z" fill={isLight ? "rgba(244,114,182,0.15)" : "rgba(255,28,116,0.1)"} stroke={isLight ? "#ec4899" : "#FF1C74"} strokeWidth="0.75" strokeLinejoin="round" />
            <line x1="2" y1="10" x2="26" y2="10" stroke={isLight ? "#ec4899" : "#FF1C74"} strokeWidth="0.75" strokeOpacity="0.45" />
          </svg>
          Atlas
        </div>

        <ul style={{ display: 'none', alignItems: 'center', gap: 26, listStyle: 'none', margin: 0, padding: 0 }}>
          {['Home', 'Tokenomics & Revenue model'].map(link => (
            <li key={link}>
              <a href="#" className="lp-nav-link" style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(242,234,246,0.48)', textDecoration: 'none', letterSpacing: '0.012em', transition: 'color 0.18s' }}>
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="lp-launch-btn"
          onClick={onQuizz}
          style={{
            padding: 'clamp(6px, 2vw, 8px) clamp(16px, 4vw, 20px)', borderRadius: 100, border: 'none',
            background: isLight ? 'linear-gradient(135deg, #FFB86C, #FF9A33)' : 'linear-gradient(135deg, #FF9500, #FF7700)',
            color: '#fff', fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 600, letterSpacing: '0.025em',
            cursor: 'pointer',
            boxShadow: isLight ? '0 0 16px rgba(244,114,182,0.3)' : '0 0 22px rgba(255,28,116,0.38)',
            transition: 'box-shadow 0.2s, transform 0.15s',
          }}
        >
          FAQ
        </button>
      </nav>

      {/* Stat card — top left */}
      <div ref={cardTlRef} className="lp-card lp-card-tl" style={{
        position: 'absolute', top: 'clamp(20px, 5vh, 94px)', left: 'clamp(12px, 3vw, 44px)', zIndex: 30,
        background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(5,1,10,0.72)',
        backdropFilter: 'blur(20px) saturate(200%)',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,28,116,0.22)',
        boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        borderRadius: 18, padding: 'clamp(16px, 3vw, 20px)', minWidth: 'clamp(160px, 80vw, 228px)',
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1, letterSpacing: '-0.02em', background: isLight ? 'linear-gradient(135deg, #f472b6, #db2777)' : 'linear-gradient(135deg, #FF88BB, #FF1C74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mise à jour
        </div>
        <div style={{ width: 30, height: 1, background: isLight ? 'rgba(244,114,182,0.4)' : 'rgba(255,28,116,0.4)', margin: '12px 0' }} />
        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', fontWeight: 500, color: isLight ? '#64748b' : 'rgba(242,234,246,0.48)', lineHeight: 1.5, maxWidth: 175, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Mise à jour régulières – fait par tes collègues de Gennevilliers
        </div>
      </div>

      {/* Stat card — bottom right */}
      <div ref={cardBrRef} className="lp-card lp-card-br" style={{
        position: 'absolute', bottom: 'clamp(20px, 10vh, 138px)', right: 'clamp(12px, 3vw, 44px)', zIndex: 30,
        background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(5,1,10,0.72)',
        backdropFilter: 'blur(20px) saturate(200%)',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,28,116,0.22)',
        boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        borderRadius: 18, padding: 'clamp(16px, 3vw, 20px)', minWidth: 'clamp(160px, 80vw, 228px)',
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1, letterSpacing: '-0.02em', background: isLight ? 'linear-gradient(135deg, #f472b6, #db2777)' : 'linear-gradient(135deg, #FF88BB, #FF1C74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Docs Internes
        </div>
        <div style={{ width: 30, height: 1, background: isLight ? 'rgba(244,114,182,0.4)' : 'rgba(255,28,116,0.4)', margin: '12px 0' }} />
        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', fontWeight: 500, color: isLight ? '#64748b' : 'rgba(242,234,246,0.48)', lineHeight: 1.5, maxWidth: 175, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          et des news locales et nationales
        </div>
      </div>

      {/* Hero — bottom left */}
      <div className="lp-hero-left" style={{ position: 'absolute', bottom: 'clamp(20px, 5vh, 50px)', left: 'clamp(12px, 3vw, 44px)', zIndex: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px 5px 10px', borderRadius: 100,
          background: isLight ? 'rgba(244,114,182,0.10)' : 'rgba(255,28,116,0.10)',
          border: isLight ? '1px solid rgba(244,114,182,0.3)' : '1px solid rgba(255,28,116,0.30)',
          fontSize: 'clamp(9px, 2vw, 10.5px)', fontWeight: 500, color: isLight ? '#db2777' : '#FF77AA',
          letterSpacing: '0.07em', textTransform: 'uppercase' as const,
          marginBottom: 14,
        }}>
          <span className="lp-badge-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: isLight ? '#db2777' : '#FF1C74', display: 'inline-block' }} />
          AI-Syndicale
        </div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(40px, 12vw, 98px)', lineHeight: 0.9, letterSpacing: '-0.04em',
          background: isLight ? 'linear-gradient(165deg, #FFB86C 22%, #FF9A33 100%)' : 'linear-gradient(165deg, #FF9500 22%, #FF7700 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Atlas
        </div>
      </div>

      {/* Hero — bottom right */}
      <div className="lp-hero-right" style={{ position: 'absolute', bottom: 'clamp(20px, 5vh, 50px)', right: 'clamp(12px, 3vw, 44px)', zIndex: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500, color: isLight ? '#64748b' : 'rgba(242,234,246,0.48)', lineHeight: 1.65, letterSpacing: '0.01em', marginBottom: 20 }}>
          Votre syndicat CFDT,<br />De GENNEVILLIERS
        </p>
        <button
          className="lp-buy-btn"
          onClick={onEnter}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: 'clamp(14px, 3vw, 18px) clamp(28px, 5vw, 40px)', borderRadius: 16,
            border: 'none',
            background: isLight ? 'linear-gradient(135deg, #FFB86C, #FF9A33)' : 'linear-gradient(135deg, #FF9500, #FF7700)',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(15px, 3.5vw, 19px)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: isLight ? '0 0 16px rgba(244,114,182,0.3)' : '0 0 22px rgba(255,28,116,0.38)',
            transition: 'box-shadow 0.2s, transform 0.15s',
          }}
        >
          Entrer
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
            <path d="M2.5 7.5H12.5M12.5 7.5L8.5 3.5M12.5 7.5L8.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <style>{`
          @keyframes lpEntryPulse {
            0%, 100% { transform: scale(1); box-shadow: ${isLight
            ? '0 0 0 4px rgba(255,0,85,0.2), 0 0 40px rgba(255,0,85,0.55), 0 8px 24px rgba(255,85,0,0.35)'
            : '0 0 0 4px rgba(255,28,116,0.25), 0 0 50px rgba(255,28,116,0.65), 0 8px 30px rgba(170,0,221,0.4)'}; }
            50% { transform: scale(1.04); box-shadow: ${isLight
            ? '0 0 0 8px rgba(255,0,85,0.12), 0 0 65px rgba(255,0,85,0.75), 0 12px 32px rgba(255,85,0,0.5)'
            : '0 0 0 8px rgba(255,28,116,0.15), 0 0 75px rgba(255,28,116,0.85), 0 12px 40px rgba(170,0,221,0.6)'}; }
          }
          .lp-buy-btn:hover { transform: scale(1.07) !important; }
          .lp-buy-btn:active { transform: scale(0.97) !important; }
        `}</style>
      </div>


      {/* Edge line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: isLight
          ? 'linear-gradient(90deg, transparent, rgba(244,114,182,0.3) 30%, rgba(244,114,182,0.3) 70%, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,28,116,0.22) 30%, rgba(255,28,116,0.22) 70%, transparent)',
        zIndex: 100, pointerEvents: 'none',
      }} />
    </div>
  )
}
