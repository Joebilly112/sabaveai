import { useCallback, useEffect, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { malaysiaCloseup, malaysiaView, shopCities, type ShopCity } from '@/lib/shop-cities';

const earthUrl = `${import.meta.env.BASE_URL}globe/earth-day.jpg`;

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function markerElement(city: ShopCity, onPick: (id: ShopCity['id'] | null) => void) {
  const el = document.createElement('button');
  el.type = 'button';
  el.dataset.city = city.id;
  el.setAttribute('aria-label', city.tooltip);
  el.style.cssText = 'width:44px;height:44px;padding:0;border:0;background:transparent;cursor:pointer;position:relative;';
  const glow = city.level === 'good' ? 14 : city.level === 'moderate' ? 18 : 22;
  const haze = city.level === 'good' ? 'rgba(43,182,115,0.55)' : city.level === 'moderate' ? 'rgba(224,168,46,0.62)' : 'rgba(240,138,60,0.72)';
  el.innerHTML = `<span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:${glow}px;height:${glow}px;transform:translate(-50%,-50%);border-radius:999px;background:radial-gradient(circle, ${haze} 0%, rgba(240,138,60,0) 70%);pointer-events:none;"></span><span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:8px;height:8px;transform:translate(-50%,-50%);border-radius:999px;background:${city.color};box-shadow:0 0 0 3px rgba(11,20,18,0.35), 0 0 12px ${city.color};"></span>`;
  el.addEventListener('mouseenter', () => onPick(city.id));
  el.addEventListener('mouseleave', () => onPick(null));
  el.addEventListener('focus', () => onPick(city.id));
  el.addEventListener('blur', () => onPick(null));
  return el;
}

function GlobeFallback() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <img
        src={earthUrl}
        alt="Peninsular Malaysia, with Shah Alam, Petaling Jaya and Johor Bahru marked by air-quality level."
        className="h-full w-full rounded-full object-cover shadow-[0_0_80px_rgba(0,0,0,0.45)]"
        style={{ objectPosition: '27% 42%' }}
      />
    </div>
  );
}

export function MalaysiaGlobe({ closeup = false }: { closeup?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const pickRef = useRef<(id: ShopCity['id'] | null) => void>(() => {});
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [settled, setSettled] = useState(false);
  const [activeId, setActiveId] = useState<ShopCity['id']>('shah-alam');
  const [paused, setPaused] = useState(false);
  const [tip, setTip] = useState({ x: 0, y: 0, show: false });
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    setWebgl(canUseWebGL());
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [webgl]);

  const placeTip = useCallback(() => {
    const globe = globeRef.current;
    const city = shopCities.find((item) => item.id === activeId);
    if (!globe || !city || !settled) {
      setTip((current) => ({ ...current, show: false }));
      return;
    }
    const coords = globe.getScreenCoords(city.lat, city.lng, 0.01);
    const marker = wrapRef.current?.querySelector(`[data-city="${city.id}"]`);
    const hidden = marker instanceof HTMLElement && Number(marker.style.opacity) === 0;
    const inside = coords.x > 8 && coords.y > 8 && wrapRef.current
      ? coords.x < wrapRef.current.clientWidth - 8 && coords.y < wrapRef.current.clientHeight - 8
      : false;
    setTip({ x: coords.x, y: coords.y, show: inside && !hidden });
  }, [activeId, settled]);

  useEffect(() => {
    pickRef.current = (id) => {
      if (id) {
        setPaused(true);
        setActiveId(id);
      } else {
        setPaused(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!settled || paused || prefersReducedMotion()) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveId((current) => {
        const index = shopCities.findIndex((city) => city.id === current);
        return shopCities[(index + 1) % shopCities.length]!.id;
      });
    }, 3400);
    return () => window.clearInterval(timer);
  }, [paused, settled]);

  useEffect(() => {
    if (!settled) return;
    placeTip();
    const controls = globeRef.current?.controls();
    const onChange = () => placeTip();
    controls?.addEventListener('change', onChange);
    window.addEventListener('resize', placeTip);
    return () => {
      controls?.removeEventListener('change', onChange);
      window.removeEventListener('resize', placeTip);
    };
  }, [placeTip, settled]);

  const htmlElement = useCallback((data: object) => markerElement(data as ShopCity, (id) => pickRef.current(id)), []);

  const onReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const renderer = globe.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x070e0c, 0);
    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    const target = closeup ? malaysiaCloseup : malaysiaView;
    if (prefersReducedMotion()) {
      globe.pointOfView(target, 0);
      controls.autoRotate = false;
      controls.enableRotate = false;
      setSettled(true);
      return;
    }
    if (closeup) {
      globe.pointOfView({ lat: 4.2, lng: 102.2, altitude: 1.35 }, 0);
      controls.autoRotate = false;
      window.setTimeout(() => {
        globe.pointOfView(malaysiaCloseup, 1700);
        window.setTimeout(() => {
          controls.enableRotate = false;
          setSettled(true);
        }, 1800);
      }, 250);
      return;
    }
    globe.pointOfView({ lat: 18, lng: 55, altitude: 2.5 }, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    window.setTimeout(() => {
      controls.autoRotate = false;
      globe.pointOfView(malaysiaView, 2100);
      window.setTimeout(() => {
        controls.enableRotate = false;
        setSettled(true);
      }, 2200);
    }, 1300);
  }, [closeup]);

  const active = shopCities.find((city) => city.id === activeId) ?? shopCities[0]!;
  const side = Math.floor(Math.min(size.width, size.height));

  return (
    <div ref={wrapRef} className={`globe-stage relative grid h-full w-full place-items-center overflow-visible${closeup ? ' globe-stage-closeup' : ''}`} role="img" aria-label="Globe focused on Peninsular Malaysia. Shah Alam is unhealthy, Petaling Jaya is moderate, and Johor Bahru is good.">
      {webgl === false ? <GlobeFallback /> : null}
      {webgl && side > 0 ? (
        <Globe
          ref={globeRef}
          width={side}
          height={side}
          backgroundColor="rgba(7,14,12,0)"
          globeImageUrl={earthUrl}
          showAtmosphere={false}
          htmlElementsData={shopCities}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0}
          htmlElement={htmlElement}
          htmlElementVisibilityModifier={(el, isVisible) => {
            el.style.opacity = isVisible ? '1' : '0';
            el.style.pointerEvents = isVisible ? 'auto' : 'none';
          }}
          onGlobeReady={onReady}
        />
      ) : null}
      {tip.show ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+16px)] rounded-md bg-[#1c2422]/92 px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-[#F4F1EA] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          style={{ left: tip.x, top: tip.y }}
          role="status"
        >
          {active.tooltip}
        </div>
      ) : null}
    </div>
  );
}
