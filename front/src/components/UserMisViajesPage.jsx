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
          <ul className="list" style={{ marginTop: 12 }}>
            {items.map((s) => (
              <li key={s.id}>
                [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros} {s.precio ? `precio=${s.precio}` : ''}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>Inicia sesión para ver tus viajes.</div>
      )}
      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}