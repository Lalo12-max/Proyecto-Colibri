import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { viajes as viajesApi, solicitudes as solicitudesApi } from '../api';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function DriverPuntosPage() {
  const { driver, driverSession } = useAuth();
  const [msg, setMsg] = useState('');
  const [nuevoPunto, setNuevoPunto] = useState({ conductorId: '', zonaNombre: '', referenciaTexto: '', puntoSalida: '', plazas: '', lat: '', lng: '', precio_base: '' });
  const [misPuntos, setMisPuntos] = useState([]);
  const [pendientesPunto, setPendientesPunto] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pickedCoord, setPickedCoord] = useState(null);
  const [modalQuery, setModalQuery] = useState('');
  const [modalResults, setModalResults] = useState([]);
  const [modalError, setModalError] = useState('');
  const [modalBounds, setModalBounds] = useState(null);
  const [modalCenter, setModalCenter] = useState({ lat: 21.5458, lng: -99.6894 });
  const abortRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  useEffect(() => {
    const did = driver?.id || '';
    if (did) setNuevoPunto((p) => ({ ...p, conductorId: did }));
  }, [driver]);

  const cargarMisPuntos = useCallback(async () => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      const data = await viajesApi.misPuntos(did, token);
      setMisPuntos(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [driverSession, driver]);

  function PickOnClick({ onPick }) { useMapEvents({ click: (e) => { const { lat, lng } = e.latlng || {}; if (lat != null && lng != null) onPick({ lat, lng }); } }); return null; }
  function CaptureBounds({ onChange, onCenter }) { const map = useMap(); React.useEffect(() => { const update = () => { const b = map.getBounds(); const sw = b.getSouthWest(); const ne = b.getNorthEast(); onChange?.({ minLat: sw.lat, minLng: sw.lng, maxLat: ne.lat, maxLng: ne.lng }); const c = map.getCenter(); onCenter?.({ lat: c.lat, lng: c.lng }); }; update(); map.on('moveend', update); map.on('zoomend', update); return () => { map.off('moveend', update); map.off('zoomend', update); }; }, [map, onChange, onCenter]); return null; }
  function FitToResults({ results }) { const map = useMap(); React.useEffect(() => { if (!results || results.length === 0) return; const bounds = results.map((r) => [r.lat, r.lng]); map.fitBounds(bounds, { padding: [20, 20] }); }, [results, map]); return null; }
  const fetchSugerencias = async (q, signal, bounds) => { if (!q) return []; const vb = bounds ? `&viewbox=${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}&bounded=1` : ''; const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&countrycodes=mx${vb}&q=${encodeURIComponent(q)}`; try { const resp = await fetch(url, { headers: { 'Accept': 'application/json' }, signal }); const json = await resp.json(); return (json || []).slice(0, 8).map(r => ({ label: r.display_name, value: `${r.lat},${r.lon}` })); } catch { return []; } };
  const fetchPhoton = async (q, signal, bounds, center) => { const bbox = bounds ? `&bbox=${bounds.minLng},${bounds.maxLat},${bounds.maxLng},${bounds.minLat}` : ''; const bias = center ? `&lat=${center.lat}&lon=${center.lng}` : ''; const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=es${bbox}${bias}`; try { const resp = await fetch(url, { signal }); const json = await resp.json(); return (json?.features || []).map(f => ({ label: f.properties?.label || f.properties?.name || 'Lugar', value: `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}` })); } catch { return []; } };
  function distanceKm(lat1, lng1, lat2, lng2) { const R = 6371; const toRad = (v) => (v * Math.PI) / 180; const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1); const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2; const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }

  const crearPunto = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const payload = {
        conductorId: nuevoPunto.conductorId,
        zonaNombre: nuevoPunto.zonaNombre || undefined,
        referenciaTexto: nuevoPunto.referenciaTexto || undefined,
        puntoSalida: nuevoPunto.puntoSalida || undefined,
        plazas: Number(nuevoPunto.plazas),
        lat: nuevoPunto.lat ? parseFloat(nuevoPunto.lat) : undefined,
        lng: nuevoPunto.lng ? parseFloat(nuevoPunto.lng) : undefined,
        precio_base: nuevoPunto.precio_base ? Number(nuevoPunto.precio_base) : undefined,
      };
      await viajesApi.crearPunto(payload, token);
      setMsg('Punto creado');
      cargarMisPuntos();
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarSolicitudesPunto = useCallback(async () => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      const data = await solicitudesApi.delConductor(did, token);
      const filtradas = (Array.isArray(data) ? data : []).filter((s) => s.punto_id);
      setPendientesPunto(filtradas.filter((s) => s.status === 'pendiente'));
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [driverSession, driver]);

  const aceptar = async (id) => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      await solicitudesApi.aceptar(id, did, token);
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const rechazar = async (id) => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      await solicitudesApi.rechazar(id, token);
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (driver) {
      cargarMisPuntos();
      cargarSolicitudesPunto();
      (async () => {
        try {
          const token = driverSession?.access_token || null;
          const did = driver?.id || null;
          const data = await solicitudesApi.delConductor(did, token);
          const activo = (Array.isArray(data) ? data : []).some((s) => s.status === 'aceptada' || s.status === 'en_progreso');
          setBloqueado(activo);
        } catch {}
      })();
    }
  }, [driver, driverSession, cargarMisPuntos, cargarSolicitudesPunto]);
  
  const onModalSearch = (q) => {
    setModalQuery(q);
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
  };

  return (
    <div className="page container">
      <h2 className="section-title">Mis puntos</h2>

      <section className="card">
        <h3 className="section-title">Crear punto</h3>
        {driver ? (
          <form onSubmit={crearPunto} className="form-grid">
            <input className="input" placeholder="Nombre del neuvo punto" value={nuevoPunto.zonaNombre} onChange={(e) => setNuevoPunto({ ...nuevoPunto, zonaNombre: e.target.value })} />
            <input className="input" placeholder="referencia (Descripción)" value={nuevoPunto.referenciaTexto} onChange={(e) => setNuevoPunto({ ...nuevoPunto, referenciaTexto: e.target.value })} />
            <input className="input" placeholder="Punto de Salida" value={nuevoPunto.puntoSalida} onChange={(e) => setNuevoPunto({ ...nuevoPunto, puntoSalida: e.target.value })} />
            <input className="input" placeholder="Plazas disponibles" value={nuevoPunto.plazas} onChange={(e) => setNuevoPunto({ ...nuevoPunto, plazas: e.target.value })} />
            <div className="grid-two">
              <button type="button" className="btn" onClick={() => { setShowModal(true); setPickedCoord(null); setModalQuery(''); setModalResults([]); }}>Elegir ubicación en mapa</button>
              <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--color-muted)' }}>{nuevoPunto.lat && nuevoPunto.lng ? `📍 ${Number(nuevoPunto.lat).toFixed(5)}, ${Number(nuevoPunto.lng).toFixed(5)}` : 'Sin coordenadas'}</div>
            </div>
            <input className="input" placeholder="Precio base por plaza (Primeros 5km)" value={nuevoPunto.precio_base} onChange={(e) => setNuevoPunto({ ...nuevoPunto, precio_base: e.target.value })} />
            <button type="submit" className="btn btn-primary">Crear punto</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para crear punto.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Solicitudes por punto activo</h3>
        {driver ? (
          <>
            <button className="btn" onClick={cargarSolicitudesPunto}>Recargar</button>
            <ul className="list" style={{ marginTop: 12 }}>
              {pendientesPunto.map((s) => (
                <li key={s.id}>
                  [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros} cliente={s.cliente_email}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn btn-primary" disabled={bloqueado} onClick={() => aceptar(s.id)}>Aceptar</button>
                    <button className="btn btn-secondary" disabled={bloqueado} onClick={() => rechazar(s.id)}>Rechazar</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Inicia sesión de conductor para ver solicitudes.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Mis puntos</h3>
        {driver ? (
          <>
            <button className="btn" onClick={cargarMisPuntos}>Recargar</button>
            <ul className="list" style={{ marginTop: 12 }}>
              {misPuntos.map((v) => (
                <li key={v.id}>
                  {v.from} | Plazas: {v.seats} | Precio: {v.price}€
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Inicia sesión de conductor para ver tus puntos.</div>
        )}
      </section>

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: 860 }}>
            <h3 className="section-title">Selecciona ubicación</h3>
            <div className="input-wrap">
              <input className="buscar-input" placeholder="Buscar lugar" value={modalQuery} onChange={(e) => onModalSearch(e.target.value)} />
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
            <div style={{ height: 420 }}>
              <MapContainer center={[modalCenter.lat, modalCenter.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <CaptureBounds onChange={setModalBounds} onCenter={setModalCenter} />
                <PickOnClick onPick={({ lat, lng }) => setPickedCoord(`${lat},${lng}`)} />
                {modalResults.map((r, idx) => (
                  <Marker key={`res-${idx}`} position={[r.lat, r.lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })} eventHandlers={{ click: () => setPickedCoord(`${r.lat},${r.lng}`) }} />
                ))}
                {pickedCoord && (() => { const [lat, lng] = pickedCoord.split(',').map(Number); return <Marker position={[lat, lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })} />; })()}
              </MapContainer>
            </div>
            <div className="card-actions" style={{ marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setPickedCoord(null); setModalQuery(''); setModalResults([]); }}>Cerrar</button>
              <button className="btn btn-primary" disabled={!pickedCoord} onClick={() => { if (pickedCoord) { const [lat, lng] = pickedCoord.split(',').map(Number); setNuevoPunto((p) => ({ ...p, lat, lng })); } setShowModal(false); }}>Usar esta ubicación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}