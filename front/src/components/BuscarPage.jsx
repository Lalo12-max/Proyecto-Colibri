import React, { useState } from 'react';
import { useViajes } from '../hooks/useViajes';
import { BuscarFormulario } from './viajes/BuscarFormulario';
import { ListaViajes } from './viajes/ListaViajes';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';
import { viajes } from '../api';

export default function BuscarPage() {
  const { criterios, setCampoBusqueda, filtrarViajes, viajeSeleccionado, seleccionarViaje, cerrarDetalles } = useViajes();
  const { user, getUserToken, getUserId, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');
  const [zonas, setZonas] = useState([]);

  const abrirOSM = (zona) => {
    const lat = zona.lat != null ? Number(zona.lat) : null;
    const lng = zona.lng != null ? Number(zona.lng) : null;
    let url = '';
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== null && lng !== null) {
      const zoom = 16;
      url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
    } else {
      const q = encodeURIComponent(`${zona.zonaNombre} ${zona.referenciaTexto || ''}`.trim());
      url = `https://www.openstreetmap.org/search?query=${q}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const abrirGoogle = (zona) => {
    const lat = zona.lat != null ? Number(zona.lat) : null;
    const lng = zona.lng != null ? Number(zona.lng) : null;
    let url = '';
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== null && lng !== null) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      const q = encodeURIComponent(`${zona.zonaNombre} ${zona.referenciaTexto || ''}`.trim());
      url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const comoLlegar = (zona) => {
    const lat = zona.lat != null ? Number(zona.lat) : null;
    const lng = zona.lng != null ? Number(zona.lng) : null;
    let url = '';
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== null && lng !== null) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      const q = encodeURIComponent(`${zona.zonaNombre} ${zona.referenciaTexto || ''}`.trim());
      url = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const solicitarPorCriterios = async (c) => {
    setMsg('');
    if (!user) { setMsg('Inicia sesión para solicitar un viaje.'); return; }
    if (!c.from || !c.to) { setMsg('Indica origen y destino.'); return; }
    try {
      const token = getUserToken();
      const payload = {
        clienteId: getUserId(),
        clienteEmail: getUserEmail(),
        origen: c.from,
        destino: c.to,
        pasajeros: parseInt(c.pasajeros || '1', 10),
      };
      await solicitudes.crear(payload, token);
      setMsg(`Solicitud creada: ${payload.origen} → ${payload.destino} para ${payload.pasajeros} pasajero(s).`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const solicitarDesdeZona = async (zona) => {
    setMsg('');
    if (!user) { setMsg('Inicia sesión para solicitar un viaje.'); return; }
    if (!criterios.to) { setMsg('Indica destino.'); return; }
    try {
      const token = getUserToken();
      const payload = {
        clienteId: getUserId(),
        clienteEmail: getUserEmail(),
        origen: zona.zonaNombre,
        destino: criterios.to,
        pasajeros: parseInt(criterios.pasajeros || '1', 10),
      };
      await solicitudes.crear(payload, token);
      setMsg(`Solicitud desde zona: ${payload.origen} → ${payload.destino}.`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  React.useEffect(() => {
    viajes.zonas().then(setZonas).catch(() => {});
  }, []);

  // Se mantiene únicamente la reserva desde un viaje seleccionado
  const solicitarReservaDeViaje = async (viaje) => {
    setMsg('');
    if (!user) { setMsg('Inicia sesión para solicitar una reserva.'); return; }
    try {
      const token = getUserToken();
      const payload = {
        clienteId: getUserId(),
        clienteEmail: getUserEmail(),
        origen: viaje.from,
        destino: viaje.to,
        pasajeros: parseInt(criterios.pasajeros || '1', 10),
      };
      await solicitudes.crear(payload, token);
      setMsg(`Reserva solicitada: ${viaje.from} → ${viaje.to} el ${viaje.date} a las ${viaje.time}.`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page container">
      <div className="app-header">
        <div className="brand"><h1>Buscar viajes</h1></div>
      </div>
      <div className="layout two-col" style={{ marginTop: 16 }}>
        <div>
          <BuscarFormulario criterios={criterios} setCampo={setCampoBusqueda} onSolicitar={solicitarPorCriterios} />
          <div style={{ marginTop: 16 }}>
            <ListaViajes viajes={filtrarViajes} onSeleccionarViaje={seleccionarViaje} />
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h2 className="section-title">Puntos comunes</h2>
            <ul className="list" style={{ marginTop: 8 }}>
              {zonas.map((z) => (
                <li key={z.id}>
                  {z.zonaNombre} {z.referenciaTexto ? `| ${z.referenciaTexto}` : ''} | Plazas: {z.plazas} | Conductor: {z.conductor} {z.precio_punto ? `| Precio punto: ${z.precio_punto}€` : ''}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn" onClick={() => solicitarDesdeZona(z)}>Solicitar desde aquí</button>
                    <button className="btn" onClick={() => abrirOSM(z)}>Ver en OSM</button>
                    <button className="btn" onClick={() => abrirGoogle(z)}>Ver en Google Maps</button>
                    <button className="btn" onClick={() => comoLlegar(z)}>Cómo llegar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
        </div>
        <div>
          {viajeSeleccionado ? (
            <div className="card">
              <h2 className="section-title">Detalles del viaje</h2>
              <div style={{ display: 'grid', gap: 6 }}>
                <div><strong>Ruta:</strong> {viajeSeleccionado.from} → {viajeSeleccionado.to}</div>
                <div><strong>Fecha:</strong> {viajeSeleccionado.date} {viajeSeleccionado.time}</div>
                <div><strong>Plazas:</strong> {viajeSeleccionado.seats}</div>
                <div><strong>Precio:</strong> {viajeSeleccionado.price}€</div>
                <div><strong>Conductor:</strong> {viajeSeleccionado.driver}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="nav-btn" onClick={cerrarDetalles}>Cerrar</button>
                <button className="nav-btn active" onClick={() => solicitarReservaDeViaje(viajeSeleccionado)}>Solicitar reserva</button>
              </div>
            </div>
          ) : (
            <div className="card">
              <h2 className="section-title">Selecciona un viaje</h2>
              <div>Elige un viaje de la lista para ver los detalles y solicitar.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}