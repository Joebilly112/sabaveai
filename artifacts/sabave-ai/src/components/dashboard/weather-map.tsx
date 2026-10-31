import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { Business } from '@workspace/api-client-react';
import { asArray } from '@/lib/as-array';
import { shopCities } from '@/lib/shop-cities';
import { SEVERITY_COLORS, SEVERITY_LABELS, clampLevel } from '@/components/dashboard/format';
import 'leaflet/dist/leaflet.css';

// CARTO dark_all now returns an “API key required” tile. Esri’s public World Dark Gray canvas is a real dark map.
const TILES = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const LABELS = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const NEUTRAL = '#7E8A84';

export function shopCoords(business: Business): { lat: number; lng: number } | null {
  if (Number.isFinite(business.lat) && Number.isFinite(business.lon)) {
    return { lat: business.lat, lng: business.lon };
  }
  const city = shopCities.find((item) => item.name.toLowerCase() === business.city.trim().toLowerCase());
  return city ? { lat: city.lat, lng: city.lng } : null;
}

function pinIcon(color: string, selected: boolean, pulse: boolean) {
  const size = selected ? 22 : 14;
  return L.divIcon({
    className: 'dash-pin-wrap',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
    html: `<span class="dash-pin${selected ? ' is-selected' : ''}${pulse ? ' is-alert' : ''}" style="--pin:${color};width:${size}px;height:${size}px"></span>`,
  });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: false });
  }, [lat, lng, map]);
  return null;
}

class MapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function MapLegend() {
  return (
    <ul className="dash-legend" data-testid="map-legend">
      {SEVERITY_LABELS.map((label, index) => (
        <li key={label}><i style={{ background: SEVERITY_COLORS[index] }} />{label}</li>
      ))}
    </ul>
  );
}

function ShopFallback({
  pins,
  selectedId,
  todayLevel,
  onSelect,
}: {
  pins: { business: Business }[];
  selectedId: string;
  todayLevel: Record<string, number>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="dash-map-fallback" role="status">
      <strong>Map tiles didn’t load</strong>
      <p>Shop locations are still listed here.</p>
      <ul>
        {pins.map(({ business }) => {
          const level = todayLevel[business.id];
          const known = level !== undefined;
          const color = known ? SEVERITY_COLORS[clampLevel(level)] : NEUTRAL;
          const detail = known ? `${business.city} · ${SEVERITY_LABELS[clampLevel(level)]}` : business.city;
          return (
            <li key={business.id}>
              <button type="button" className={business.id === selectedId ? 'is-selected' : ''} onClick={() => onSelect(business.id)}>
                <i style={{ background: color }} />
                <span>
                  <strong>{business.name}</strong>
                  <small>{detail}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WeatherMap({
  businesses,
  selectedId,
  todayLevel,
  alertBusinessId,
  onSelect,
  loading,
}: {
  businesses: Business[];
  selectedId: string;
  todayLevel: Record<string, number>;
  alertBusinessId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const tileOk = useRef(false);
  const [tileErrors, setTileErrors] = useState(0);
  const [tilesFailed, setTilesFailed] = useState(false);
  const pins = asArray<Business>(businesses).flatMap((business) => {
    const coords = shopCoords(business);
    return coords ? [{ business, coords }] : [];
  });
  const selected = pins.find((pin) => pin.business.id === selectedId) ?? pins[0];

  useEffect(() => {
    if (tileErrors < 2 || tileOk.current) return;
    const timer = window.setTimeout(() => {
      if (!tileOk.current) setTilesFailed(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [tileErrors]);

  return (
    <section className="dash-map-card" aria-label="Weather map" data-testid="weather-map">
      <div className="dash-map-frame">
        {loading ? (
          <div className="dash-map-skeleton skeleton" aria-label="Loading map" />
        ) : tilesFailed || !selected ? (
          <ShopFallback pins={pins} selectedId={selectedId} todayLevel={todayLevel} onSelect={onSelect} />
        ) : (
          <MapBoundary fallback={<ShopFallback pins={pins} selectedId={selectedId} todayLevel={todayLevel} onSelect={onSelect} />}>
          <MapContainer
            center={[selected.coords.lat, selected.coords.lng]}
            zoom={11}
            minZoom={5}
            maxZoom={14}
            scrollWheelZoom={false}
            zoomControl={false}
            className="dash-leaflet"
          >
            <ZoomControl position="topright" />
            <TileLayer
              attribution='&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url={TILES}
              eventHandlers={{
                tileload: () => { tileOk.current = true; },
                tileerror: () => setTileErrors((count) => count + 1),
              }}
            />
            <TileLayer url={LABELS} />
            <Recenter lat={selected.coords.lat} lng={selected.coords.lng} />
            {pins.map(({ business, coords }) => {
              const level = todayLevel[business.id];
              const known = level !== undefined;
              const color = known ? SEVERITY_COLORS[clampLevel(level)] : NEUTRAL;
              const severity = known ? SEVERITY_LABELS[clampLevel(level)] : null;
              const isSelected = business.id === selectedId;
              const pulse = isSelected && alertBusinessId === business.id;
              return (
                <Marker
                  key={`${business.id}-${known ? level : 'none'}-${pulse ? 'pulse' : 'still'}`}
                  position={[coords.lat, coords.lng]}
                  icon={pinIcon(color, isSelected, pulse)}
                  zIndexOffset={isSelected ? 500 : 0}
                  keyboard
                  title={severity ? `${business.name}, ${severity}` : `${business.name}, ${business.city}`}
                  eventHandlers={{ click: () => onSelect(business.id) }}
                >
                  <Popup>
                    <strong>{business.name}</strong>
                    <span>{severity ? `${business.city} · ${severity}` : business.city}</span>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          </MapBoundary>
        )}
        {!loading && <MapLegend />}
      </div>
    </section>
  );
}
