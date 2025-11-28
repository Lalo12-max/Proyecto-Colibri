import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';

export default function SolicitudesPage({ mode = 'cliente' }) {
  const { user, driver, getUserToken, getDriverToken, getUserEmail, getDriverId } = useAuth();
  const [clienteEmailHist, setClienteEmailHist] = useState('');
  const [historial, setHistorial] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [msg, setMsg] = useState('');
  const [bloqueado, setBloqueado] = useState(false);


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
      (async () => {
        try {
          const token = getDriverToken();
          const asignadas = await solicitudes.delConductor(getDriverId(), token);
          const activo = (Array.isArray(asignadas) ? asignadas : []).some((s) => s.status === 'aceptada' || s.status === 'en_progreso');
          setBloqueado(activo);
        } catch {}
      })();
    }
  }, [mode, driver, cargarPendientes, getDriverToken, getDriverId]);

  return (
    <div className="page container">
      <h2 className="section-title">Solicitudes</h2>

      {mode === 'cliente' && (
        <section className="card">
          <h3 className="section-title">Mi historial</h3>
          {user ? (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={cargarHistorial}>Actualizar</button>
              </div>
              <div className="card" style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Origen</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Destino</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Pasajeros</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((s) => (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--border-color, #e5e5e5)' }}>
                        <td style={{ padding: 8 }}>{s.status}</td>
                        <td style={{ padding: 8 }}>{s.origen}</td>
                        <td style={{ padding: 8 }}>{s.destino}</td>
                        <td style={{ padding: 8 }}>{s.pasajeros}</td>
                        <td style={{ padding: 8 }}>{s.precio ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={cargarPendientes}>Actualizar</button>
              </div>
              <div className="card" style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Origen</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Destino</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Pasajeros</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Cliente</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Precio</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.filter((s) => !s.punto_id).map((s) => (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--border-color, #e5e5e5)' }}>
                        <td style={{ padding: 8 }}>{s.status}</td>
                        <td style={{ padding: 8 }}>{s.origen}</td>
                        <td style={{ padding: 8 }}>{s.destino}</td>
                        <td style={{ padding: 8 }}>{s.pasajeros}</td>
                        <td style={{ padding: 8 }}>{s.cliente_email}</td>
                        <td style={{ padding: 8 }}>{s.precio ?? '—'}</td>
                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary" onClick={() => aceptar(s.id)}>Aceptar</button>
                            <button className="btn btn-secondary" onClick={() => rechazar(s.id)}>Rechazar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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