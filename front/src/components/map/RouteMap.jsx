import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const primaryColor = (() => {
  if (typeof window !== 'undefined') {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    return v?.trim() || '#2563eb';
  }
  return '#2563eb';
})();

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// NUEVO: centro por defecto en Arroyo Seco (cabecera municipal)
const ARROYO_SECO_CENTER = { lat: 21.5458, lng: -99.6894 };

function parseLatLng(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const m = texto.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

async function geocode(texto, hint = 'Querétaro, México') {
  if (!texto) return null;

  const trySearch = async (q) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await resp.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    const { lat, lon } = json[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  };

  const primero = await trySearch(texto);
  if (primero) return primero;
  const segundo = await trySearch(`${texto}, ${hint}`);
  return segundo;
}

async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (!json?.routes?.[0]?.geometry?.coordinates) return [];
  // OSRM coords are [lng,lat]; convert to [lat,lng] for Leaflet
  return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function FitToData({ from, to, path }) {
  const map = useMap();
  React.useEffect(() => {
    const bounds = [];
    if (from) bounds.push([from.lat, from.lng]);
    if (to) bounds.push([to.lat, to.lng]);
    if (path && path.length > 0) bounds.push(...path);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, from, to, path]);
  return null;
}

export function RouteMap({ origen, destino, height = 620 }) {
  const [from, setFrom] = React.useState(null);
  const [to, setTo] = React.useState(null);
  const [path, setPath] = React.useState([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const fCoord = parseLatLng(origen);
        const tCoord = parseLatLng(destino);
        const f = fCoord || (await geocode(origen));
        const t = tCoord || (await geocode(destino));
        if (!alive) return;
        setFrom(f);
        setTo(t);
        if (f && t) {
          const p = await fetchRoute(f, t);
          if (!alive) return;
          setPath(p);
        } else {
          setPath([]);
        }
      } catch {
        setPath([]);
      }
    })();
    return () => { alive = false; };
  }, [origen, destino]);

  const startCenter = from || to || ARROYO_SECO_CENTER;

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <MapContainer
        center={[startCenter.lat, startCenter.lng]}
        zoom={13}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {from && <Marker position={[from.lat, from.lng]} icon={defaultIcon} />}
        {to && <Marker position={[to.lat, to.lng]} icon={defaultIcon} />}
        {path.length > 0 && (
          <Polyline positions={path} pathOptions={{ color: primaryColor, weight: 5 }} />
        )}
        <FitToData from={from} to={to} path={path} />
      </MapContainer>
    </div>
  );
}