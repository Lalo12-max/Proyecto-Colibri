import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';

export default function SolicitudesPage({ mode = 'cliente' }) {
  const { user, driver, getUserToken, getDriverToken, getUserEmail, getDriverId } = useAuth();
  const [clienteEmailHist, setClienteEmailHist] = useState('');
  const [historial, setHistorial] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [msg, setMsg] = useState('');


  const cargarHistorial = useCallback(async () => {
    setMsg('');
    try {
      const token = getUserToken();
      const data = await solicitudes.listarCliente(clienteEmailHist || getUserEmail(), token);
      setHistorial(data);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [getUserToken, getUserEmail, clienteEmailHist]);

  const cargarPendientes = useCallback(async () => {
    setMsg('');
    try {
      const token = getDriverToken();
      const data = await solicitudes.pendientesConductor(getDriverId(), token);
      setPendientes(data);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [getDriverToken, getDriverId]);

  const aceptar = async (id) => {
    setMsg('');
    try {
      const token = getDriverToken();
      const res = await solicitudes.aceptar(id, getDriverId(), token);
      setMsg(`Aceptada id=${res.id} precio=${res.precio}`);
      cargarPendientes();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const rechazar = async (id) => {
    setMsg('');
    try {
      const token = getDriverToken();
      const res = await solicitudes.rechazar(id, token);
      setMsg(`Rechazada id=${res.id}`);
      cargarPendientes();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };


  React.useEffect(() => {
    const uemail = getUserEmail();
    setClienteEmailHist((prev) => prev || uemail || '');
  }, [getUserEmail, user]);

  React.useEffect(() => {
    if (mode === 'cliente' && user) {
      cargarHistorial();
    }
  }, [mode, user, cargarHistorial]);

  React.useEffect(() => {
    if (mode === 'conductor' && driver) {
      cargarPendientes();
    }
  }, [mode, driver, cargarPendientes]);

  return (
    <div className="page container">
      <h2 className="section-title">Solicitudes</h2>

      {mode === 'cliente' && (
        <section className="card">
          <h3 className="section-title">Mi historial</h3>
          {user ? (
            <>
              <div className="card-actions">
                <button className="btn btn-secondary" onClick={cargarHistorial}>Actualizar</button>
              </div>
              <ul className="sol-list">
                {historial.map((s) => (
                  <li key={s.id} className="sol-item">
                    <div className="sol-item-header"><strong>{s.origen}</strong> → <strong>{s.destino}</strong></div>
                    <div className="sol-item-meta">
                      Estado: {s.status} | Pasajeros: {s.pasajeros} {s.precio ? `| Precio: ${s.precio}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>Inicia sesión para ver tu historial.</div>
          )}
        </section>
      )}

      {mode === 'conductor' && (
        <section className="card">
          <h3 className="section-title">Solicitudes pendientes</h3>
          {driver ? (
            <>
              <div className="card-actions">
                <button className="btn btn-secondary" onClick={cargarPendientes}>Actualizar</button>
              </div>
              <ul className="sol-list">
                {pendientes.filter((s) => s.tipo ? s.tipo !== 'punto' : true).map((s) => (
                  <li key={s.id} className="sol-item">
                    <div className="sol-item-header"><strong>{s.origen}</strong> → <strong>{s.destino}</strong></div>
                    <div className="sol-item-meta">Pasajeros: {s.pasajeros}</div>
                    <div className="sol-item-meta">Cliente: {s.cliente_email}</div>
                    <div className="sol-item-actions">
                      <button className="btn btn-primary" onClick={() => aceptar(s.id)}>Aceptar</button>
                      <button className="btn btn-secondary" onClick={() => rechazar(s.id)}>Rechazar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>Inicia sesión de conductor.</div>
          )}
        </section>
      )}

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}