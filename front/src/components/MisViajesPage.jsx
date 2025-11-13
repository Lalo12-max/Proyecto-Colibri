import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes as solicitudesApi } from '../api';

export default function MisViajesPage() {
  const { driver, getDriverId, getDriverToken } = useAuth();
  const [misViajes, setMisViajes] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!driver) return;
    setMsg('');
    (async () => {
      try {
        const token = getDriverToken();
        const did = getDriverId();
        const data = await solicitudesApi.delConductor(did, token);
        const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'aceptada' || s.status === 'en_progreso' || s.status === 'completada');
        setMisViajes(viajes);
      } catch (err) {
        setMsg(`Error: ${err.message}`);
      }
    })();
  }, [driver, getDriverToken, getDriverId]);

  if (!driver) return <div className="page container">Inicia sesión como conductor.</div>;

  const iniciar = async (id) => {
    setMsg('');
    try {
      const token = getDriverToken();
      await solicitudesApi.iniciar(id, token);
      const did = getDriverId();
      const data = await solicitudesApi.delConductor(did, token);
      const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'aceptada' || s.status === 'en_progreso' || s.status === 'completada');
      setMisViajes(viajes);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const finalizar = async (id) => {
    setMsg('');
    try {
      const token = getDriverToken();
      await solicitudesApi.finalizar(id, token);
      const did = getDriverId();
      const data = await solicitudesApi.delConductor(did, token);
      const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'aceptada' || s.status === 'en_progreso' || s.status === 'completada');
      setMisViajes(viajes);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Mis viajes</h1></div></div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="form-grid">
          <button className="btn" onClick={() => {
            setMsg('');
            (async () => {
              try {
                const token = getDriverToken();
                const did = getDriverId();
                const data = await solicitudesApi.delConductor(did, token);
                const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'aceptada' || s.status === 'en_progreso' || s.status === 'completada');
                setMisViajes(viajes);
              } catch (err) {
                setMsg(`Error: ${err.message}`);
              }
            })();
          }}>Actualizar</button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Listado</h3>
        <ul className="list" style={{ marginTop: 12 }}>
          {misViajes.map((s) => (
            <li key={s.id}>
              [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros} cliente={s.cliente_email}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {s.status === 'aceptada' && (
                  <button className="btn btn-primary" onClick={() => iniciar(s.id)}>Iniciar</button>
                )}
                {s.status === 'en_progreso' && (
                  <button className="btn btn-secondary" onClick={() => finalizar(s.id)}>Finalizar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}