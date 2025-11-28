import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes as solicitudesApi } from '../api';

export default function UserMisViajesPage() {
  const { user, getUserToken, getUserEmail } = useAuth();
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    setMsg('');
    (async () => {
      try {
        const token = getUserToken();
        const data = await solicitudesApi.listarCliente(getUserEmail(), token);
        const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'completada');
        setItems(viajes);
      } catch (err) {
        setMsg(`Error: ${err.message}`);
      }
    })();
  }, [user, getUserToken, getUserEmail]);

  return (
    <div className="page container">
      <h2 className="section-title">Mis viajes</h2>
      {user ? (
        <>
          <button className="btn" onClick={() => {
            setMsg('');
            (async () => {
              try {
                const token = getUserToken();
                const data = await solicitudesApi.listarCliente(getUserEmail(), token);
                const viajes = (Array.isArray(data) ? data : []).filter((s) => s.status === 'completada');
                setItems(viajes);
              } catch (err) {
                setMsg(`Error: ${err.message}`);
              }
            })();
          }}>Actualizar</button>
          <div className="card" style={{ overflowX: 'auto', marginTop: 12 }}>
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
                {items.map((s) => (
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
        <div>Inicia sesión para ver tus viajes.</div>
      )}
      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}