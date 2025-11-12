import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';
import { viajes } from '../api';

export default function BuscarPage() {
  const [nueva, setNueva] = useState({ origen: '', destino: '', pasajeros: '1' });
  const { user, getUserToken, getUserId, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');
  const [puntos, setPuntos] = useState([]);

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
      };
      await solicitudes.crear(payload, token);
      setMsg(`Solicitud creada: ${payload.origen} → ${payload.destino} (${payload.pasajeros})`);
      setNueva({ origen: '', destino: '', pasajeros: '1' });
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

  return (
    <div className="page container">
      <div className="app-header">
        <div className="brand"><h1>Solicitar viaje</h1></div>
      </div>
      <div style={{ marginTop: 16 }}>
        <section className="card">
          <h3 className="section-title">Solicitar viaje</h3>
          <form onSubmit={crearSolicitud} className="form-grid">
            <input className="input" placeholder="Origen" value={nueva.origen} onChange={(e) => setNueva({ ...nueva, origen: e.target.value })} />
            <select className="input" value="" onChange={(e) => setNueva({ ...nueva, origen: e.target.value })}>
              <option value="">Selecciona un punto publicado</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.zonaNombre}>{p.zonaNombre}</option>
              ))}
            </select>
            <input className="input" placeholder="Destino" value={nueva.destino} onChange={(e) => setNueva({ ...nueva, destino: e.target.value })} />
            <input className="input" type="number" min="1" max="6" placeholder="Pasajeros" value={nueva.pasajeros} onChange={(e) => setNueva({ ...nueva, pasajeros: e.target.value })} />
            <button type="submit" className="btn btn-primary">Crear</button>
          </form>
          <h4 className="section-title" style={{ marginTop: 12 }}>Puntos de partida publicados</h4>
          <ul className="list" style={{ marginTop: 8 }}>
            {puntos.map((p) => (
              <li key={p.id}>
                <strong>{p.zonaNombre}</strong> {p.referenciaTexto ? `— ${p.referenciaTexto}` : ''} | Plazas: {p.plazas} | Conductor: {p.conductor} {p.precio_punto ? `| Precio base: ${p.precio_punto}` : ''}
              </li>
            ))}
          </ul>
        </section>
        {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
      </div>
    </div>
  );
}