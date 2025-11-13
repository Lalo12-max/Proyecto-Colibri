import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';
import { viajes } from '../api';
import { RouteMap } from './map/RouteMap';

export default function BuscarPage() {
  const [nueva, setNueva] = useState({ origen: '21.5458,-99.6894', destino: '', pasajeros: '1' });
  const { user, getUserToken, getUserId, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');
  const [puntos, setPuntos] = useState([]);

  // NUEVO: destinos fijos con coordenadas
  const destinosFijos = [
    { label: '🚌 Central de Autobuses (Cabecera Municipal)', value: '21.5458,-99.6894' },
    { label: '🕳️ Sótano del Barro', value: '21.3107,-99.6679' },
    { label: '⛪ Misión de Concá', value: '21.5236,-99.6521' },
    { label: '🌊 Las Adjuntas', value: '21.4782,-99.5204' },
    { label: '🌳 Árbol Milenario', value: '21.5562,-99.6805' },
    { label: '🏺 Zona Arqueológica / Arte Rupestre', value: '21.4900,-99.6000' },
    { label: '💦 Balneario Abanico', value: '21.5209,-99.6498' },
    { label: '🌄 La Florida', value: '21.5631,-99.6057' },
  ];

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
        {/* MAPA a pantalla completa dentro de la tarjeta */}
        <section className="card">
          <h3 className="section-title">Solicitar viaje</h3>

          <div className="map-planner">
            <RouteMap origen={nueva.origen} destino={nueva.destino} />
            <div className="map-overlay">
              <form className="overlay-card" onSubmit={crearSolicitud}>
                <div className="input-wrap">
                  <label className="input-label">Origen</label>
                  <input
                    className="buscar-input"
                    placeholder="Origen"
                    value={nueva.origen}
                    onChange={(e) => setNueva({ ...nueva, origen: e.target.value })}
                  />
                </div>

                {/* Selector de ORIGEN con LOCACIONES NUEVAS */}
                <div className="input-wrap">
                  <label className="input-label">Selecciona un origen sugerido</label>
                  <select
                    className="buscar-input"
                    value={nueva.origen}
                    onChange={(e) => setNueva({ ...nueva, origen: e.target.value })}
                  >
                    <option value="">—</option>
                    {destinosFijos.map((d) => (
                      <option key={`orig-${d.value}`} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-wrap">
                  <label className="input-label">Destino</label>
                  <input
                    className="buscar-input"
                    placeholder="Destino"
                    value={nueva.destino}
                    onChange={(e) => setNueva({ ...nueva, destino: e.target.value })}
                  />
                </div>

                <div className="input-wrap">
                  <label className="input-label">Selecciona un destino sugerido</label>
                  <select
                    className="buscar-input"
                    value={nueva.destino}
                    onChange={(e) => setNueva({ ...nueva, destino: e.target.value })}
                  >
                    <option value="">—</option>
                    {destinosFijos.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                    {/* Si prefieres quitar los puntos publicados de destino, avísame */}
                  </select>
                </div>

                <div className="input-wrap">
                  <label className="input-label">Pasajeros</label>
                  <input
                    className="buscar-input"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="1"
                    value={nueva.pasajeros}
                    onChange={(e) => setNueva({ ...nueva, pasajeros: e.target.value })}
                  />
                </div>

                <div className="overlay-actions">
                  <button type="submit" className="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>

          {/* Lista informativa debajo, sin cambiar tu flujo */}
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