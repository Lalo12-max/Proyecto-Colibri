import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';

export default function MisSolicitudesPage() {
  const { user, driver, getUserEmail, getUserToken, getDriverId, getDriverToken } = useAuth();
  const [modo, setModo] = useState(user ? 'cliente' : 'conductor');
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    setMsg('');
    (async () => {
      try {
        if (modo === 'cliente' && user) {
          const token = getUserToken();
          const data = await solicitudes.listarCliente(getUserEmail(), token);
          setItems(data);
        } else if (modo === 'conductor' && driver) {
          const token = getDriverToken();
          const data = await solicitudes.delConductor(getDriverId(), token);
          setItems(data);
        }
      } catch (err) {
        setMsg(`Error: ${err.message}`);
      }
    })();
  }, [modo, user, driver, getUserToken, getUserEmail, getDriverToken, getDriverId]);

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Mis solicitudes</h1></div></div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className={`nav-btn ${modo === 'cliente' ? 'active' : ''}`} onClick={() => setModo('cliente')}>Como cliente</button>
        <button className={`nav-btn ${modo === 'conductor' ? 'active' : ''}`} onClick={() => setModo('conductor')}>Como conductor</button>
        <button className="nav-btn" onClick={() => {
          setMsg('');
          (async () => {
            try {
              if (modo === 'cliente' && user) {
                const token = getUserToken();
                const data = await solicitudes.listarCliente(getUserEmail(), token);
                setItems(data);
              } else if (modo === 'conductor' && driver) {
                const token = getDriverToken();
                const data = await solicitudes.delConductor(getDriverId(), token);
                setItems(data);
              }
            } catch (err) {
              setMsg(`Error: ${err.message}`);
            }
          })();
        }}>Actualizar</button>
        <select className="nav-btn" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="cotizada">Cotizada</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
          <option value="cancelada">Cancelada</option>
          <option value="completada">Completada</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <ul>
          {items.filter((s) => !filtro || s.status === filtro).map((s) => (
            <li key={s.id}>
              [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros}
              {s.cliente_nombre ? ` | Cliente: ${s.cliente_nombre}` : s.cliente_email ? ` | Cliente: ${s.cliente_email}` : ''}
              {s.conductor_nombre ? ` | Conductor: ${s.conductor_nombre}` : ''}
              {s.precio ? ` | Precio: ${s.precio}€` : ''}
            </li>
          ))}
        </ul>
      </div>
      {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}