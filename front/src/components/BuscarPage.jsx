import React, { useState } from 'react';
import { useViajes } from '../hooks/useViajes';
import { BuscarFormulario } from './viajes/BuscarFormulario';
import { ListaViajes } from './viajes/ListaViajes';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';

export default function BuscarPage() {
  const { criterios, setCampoBusqueda, filtrarViajes, viajeSeleccionado, seleccionarViaje, cerrarDetalles } = useViajes();
  const { user, getUserToken, getUserId, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');

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