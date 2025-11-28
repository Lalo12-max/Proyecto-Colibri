import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';
import { viajes } from '../api';
import { RouteMap } from './map/RouteMap';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function BuscarPage() {
  const [nueva, setNueva] = useState({ origen: '21.5458,-99.6894', destino: '', pasajeros: '1', tipo: 'solicitud', puntoId: null });
  const { user, getUserToken, getUserId, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');
  const [puntos, setPuntos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectingField, setSelectingField] = useState(null);
  const [pickedCoord, setPickedCoord] = useState(null);
  const [busqOrigen, setBusqOrigen] = useState('');
  const [sugsOrigen, setSugsOrigen] = useState([]);
  const [busqDestino, setBusqDestino] = useState('');
  const [sugsDestino, setSugsDestino] = useState([]);
  const [modalQuery, setModalQuery] = useState('');
  const [modalResults, setModalResults] = useState([]);
  const [modalError, setModalError] = useState('');
  const [modalBounds, setModalBounds] = useState(null);
  const [modalCenter, setModalCenter] = useState({ lat: 21.5458, lng: -99.6894 });
  const abortRef = React.useRef(null);
  const debounceRef = React.useRef(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((text) => { setToast({ text }); setTimeout(() => setToast(null), 4000); }, []);

  const fetchSugerencias = async (q, signal, bounds) => {
    if (!q) return [];
    const vb = bounds ? `&viewbox=${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}&bounded=1` : '';
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&countrycodes=mx${vb}&q=${encodeURIComponent(q)}`;
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' }, signal });
      const json = await resp.json();
      return (json || []).slice(0, 8).map(r => ({ label: r.display_name, value: `${r.lat},${r.lon}` }));
    } catch (_e) {
      return [];
    }
  };

  const fetchPhoton = async (q, signal, bounds, center) => {
    const bbox = bounds ? `&bbox=${bounds.minLng},${bounds.maxLat},${bounds.maxLng},${bounds.minLat}` : '';
    const bias = center ? `&lat=${center.lat}&lon=${center.lng}` : '';
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=es${bbox}${bias}`;
    try {
      const resp = await fetch(url, { signal });
      const json = await resp.json();
      return (json?.features || []).map(f => ({
        label: f.properties?.label || f.properties?.name || 'Lugar',
        value: `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
      }));
    } catch (_e) {
      return [];
    }
  };

  function PickOnClick({ onPick }) {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng || {};
        if (lat != null && lng != null) onPick({ lat, lng });
      }
    });
    return null;
  }

  function FitToResults({ results }) {
    const map = useMap();
    React.useEffect(() => {
      if (!results || results.length === 0) return;
      const bounds = results.map((r) => [r.lat, r.lng]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }, [results, map]);
    return null;
  }

  function CaptureBounds({ onChange, onCenter }) {
    const map = useMap();
    React.useEffect(() => {
      const update = () => {
        const b = map.getBounds();
        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
        onChange?.({ minLat: sw.lat, minLng: sw.lng, maxLat: ne.lat, maxLng: ne.lng });
        const c = map.getCenter();
        onCenter?.({ lat: c.lat, lng: c.lng });
      };
      update();
      map.on('moveend', update);
      map.on('zoomend', update);
      return () => {
        map.off('moveend', update);
        map.off('zoomend', update);
      };
    }, [map, onChange, onCenter]);
    return null;
  }

  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const crearSolicitud = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (!user) { setMsg('Inicia sesión para crear solicitudes.'); return; }
      const token = getUserToken();
      const payload = {
        clienteId: getUserId(),
        clienteEmail: getUserEmail(),
        origen: nueva.origen,
        destino: nueva.destino,
        pasajeros: parseInt(nueva.pasajeros || '1', 10),
        tipo: nueva.tipo,
        puntoId: nueva.puntoId,
      };
      await solicitudes.crear(payload, token);
      showToast('Tu viaje ha sido publicado');
      setMsg(`Solicitud creada: ${payload.origen} → ${payload.destino} (${payload.pasajeros})`);
      setNueva({ origen: '', destino: '', pasajeros: '1', tipo: 'solicitud', puntoId: null });
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarPuntos = useCallback(async () => {
    setMsg('');
    try {
      const data = await viajes.zonas();
      setPuntos(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, []);

  React.useEffect(() => {
    cargarPuntos();
  }, [cargarPuntos]);

  React.useEffect(() => {
    (async () => {
      try {
        if (!user) { setBloqueado(false); return; }
        const token = getUserToken();
        const hist = await solicitudes.listarCliente(getUserEmail(), token);
        const activo = (Array.isArray(hist) ? hist : []).some((s) => s.status === 'aceptada' || s.status === 'en_progreso');
        setBloqueado(activo);
      } catch {}
    })();
  }, [user, getUserToken, getUserEmail]);

  return (
    <div className="page container">
      <div className="app-header">
        <div className="brand"><h1>Solicitar viaje</h1></div>
      </div>
      <div style={{ marginTop: 16 }}>
        {/* MAPA a pantalla completa dentro de la tarjeta */}
        <section className="card">
          <h3 className="section-title">Solicitar viaje</h3>

          <div className="layout two-col">
            <div>
              <RouteMap origen={nueva.origen} destino={nueva.destino} />
            </div>
            <div className="card" style={{ padding: 12 }}>
              <h4 className="section-title">Planificador</h4>
              <div className="input-wrap">
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectingField('origen'); setPickedCoord(null); setModalQuery(''); setModalResults([]); setShowModal(true); }}>Buscar origen</button>
              </div>
              <div className="input-wrap">
                <label className="input-label">Origen sugerido</label>
                <select className="buscar-input" value={nueva.puntoId || ''} onChange={(e) => {
                  const id = e.target.value || null;
                  const p = puntos.find((pp) => String(pp.id) === String(id));
                  if (!p) { setNueva({ ...nueva, puntoId: null, tipo: 'solicitud' }); return; }
                  const coord = p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : (p.zonaNombre || '');
                  setNueva({ ...nueva, origen: coord, puntoId: p.id, tipo: 'punto' });
                }}>
                  <option value="">—</option>
                  {puntos.map((p) => (
                    <option key={`orig-${p.id}`} value={p.id}>{p.zonaNombre} {p.referenciaTexto ? `— ${p.referenciaTexto}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrap" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectingField('destino'); setPickedCoord(null); setModalQuery(''); setModalResults([]); setShowModal(true); }}>Buscar destino</button>
              </div>
              <div className="input-wrap">
                <label className="input-label">Destino sugerido</label>
                <select className="buscar-input" value={nueva.destino} onChange={(e) => setNueva({ ...nueva, destino: e.target.value })}>
                  <option value="">—</option>
                  {puntos.map((p) => (
                    <option key={`dest-${p.id}`} value={p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : (p.zonaNombre || '')}>{p.zonaNombre} {p.referenciaTexto ? `— ${p.referenciaTexto}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrap">
                <label className="input-label">Pasajeros</label>
                <input className="buscar-input" type="number" min="1" max="6" placeholder="1" value={nueva.pasajeros} onChange={(e) => setNueva({ ...nueva, pasajeros: e.target.value })} />
              </div>
              <div className="overlay-actions">
                <button type="button" className="btn btn-primary" disabled={bloqueado} onClick={crearSolicitud}>Crear</button>
              </div>
            </div>
          </div>

          <h4 className="section-title" style={{ marginTop: 12 }}>Puntos de partida publicados</h4>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Punto</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Referencia</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Plazas</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Conductor</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Precio base</th>
                </tr>
              </thead>
              <tbody>
                {puntos.map((p) => (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--border-color, #e5e5e5)' }}>
                    <td style={{ padding: 8 }}>{p.zonaNombre}</td>
                    <td style={{ padding: 8 }}>{p.referenciaTexto || '—'}</td>
                    <td style={{ padding: 8 }}>{p.plazas}</td>
                    <td style={{ padding: 8 }}>{p.conductor}</td>
                    <td style={{ padding: 8 }}>{p.precio_punto ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div style={{ position: 'fixed', right: 0, top: 64, height: 'calc(100% - 64px)', width: 'min(420px, 90%)', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.2)', zIndex: 1000 }}>
              <div className="card" style={{ height: '100%' }}>
                <h3 className="section-title">Selecciona {selectingField}</h3>
                <div className="input-wrap">
                  <input className="buscar-input" placeholder={`Buscar ${selectingField}`} value={modalQuery} onChange={(e) => {
                    const q = e.target.value; setModalQuery(q);
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(async () => {
                      try {
                        if (abortRef.current) abortRef.current.abort();
                        abortRef.current = new AbortController();
                        let sugs = await fetchSugerencias(q, abortRef.current.signal, modalBounds);
                        let res = sugs.map((s) => { const [lat, lng] = s.value.split(',').map(Number); return { lat, lng, label: s.label }; });
                        if (res.length === 0) {
                          const sugs2 = await fetchPhoton(q, abortRef.current.signal, modalBounds, modalCenter);
                          res = sugs2.map((s) => { const [lat, lng] = s.value.split(',').map(Number); return { lat, lng, label: s.label }; });
                        }
                        res = res.map((r) => ({ ...r, distKm: distanceKm(modalCenter.lat, modalCenter.lng, r.lat, r.lng) }))
                          .sort((a, b) => (a.distKm ?? 0) - (b.distKm ?? 0));
                        setModalResults(res);
                        setModalError('');
                      } catch (_e) {
                        setModalResults([]);
                        setModalError('Fallo de red o límite de búsqueda. Intenta de nuevo.');
                      }
                    }, 400);
                  }} />
                  {modalError && <div style={{ color: 'var(--color-accent)', fontSize: 12, marginTop: 6 }}>{modalError}</div>}
                  {modalResults.length > 0 && (
                    <ul className="list" style={{ maxHeight: 160, overflow: 'auto', marginTop: 6 }}>
                      {modalResults.map((r, idx) => (
                        <li key={`txt-${idx}`}>
                          <button type="button" className="btn" onClick={() => setPickedCoord(`${r.lat},${r.lng}`)}>📍 {r.label} {r.distKm != null ? `— ${r.distKm.toFixed(1)} km` : ''}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div style={{ height: '70%' }}>
                  <MapContainer center={[21.5458, -99.6894]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                    <CaptureBounds onChange={setModalBounds} onCenter={setModalCenter} />
                    <PickOnClick onPick={({ lat, lng }) => setPickedCoord(`${lat},${lng}`)} />
                    {modalResults.map((r, idx) => (
                      <Marker key={`res-${idx}`} position={[r.lat, r.lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })} eventHandlers={{ click: () => setPickedCoord(`${r.lat},${r.lng}`) }} />
                    ))}
                    <FitToResults results={modalResults} />
                    {pickedCoord && (() => { const [lat, lng] = pickedCoord.split(',').map(Number); return <Marker position={[lat, lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })} />; })()}
                  </MapContainer>
                </div>
                <div className="card-actions" style={{ marginTop: 10 }}>
                  <button className="btn btn-secondary" onClick={() => { setShowModal(false); setPickedCoord(null); setSelectingField(null); }}>Cerrar</button>
                  <button className="btn btn-primary" disabled={!pickedCoord} onClick={() => {
                    if (selectingField === 'origen') setNueva({ ...nueva, origen: pickedCoord, tipo: 'solicitud', puntoId: null });
                    if (selectingField === 'destino') setNueva({ ...nueva, destino: pickedCoord });
                    setShowModal(false); setPickedCoord(null); setSelectingField(null);
                  }}>Usar este punto</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
        {toast && (
          <div style={{ position: 'fixed', right: 16, bottom: 16, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: 12, padding: 12, zIndex: 2000, minWidth: 280, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>{toast.text}</div>
            <button className="btn" onClick={() => setToast(null)}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}