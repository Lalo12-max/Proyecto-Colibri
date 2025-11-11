import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { viajes as viajesApi } from '../api';
import { ListaViajes } from './viajes/ListaViajes';

export default function MisViajesPage() {
  const { driver, getDriverId, getDriverToken } = useAuth();
  const [estado, setEstado] = useState('');
  const [misViajes, setMisViajes] = useState([]);
  const [msg, setMsg] = useState('');

  const cargar = async () => {
    setMsg('');
    try {
      const token = getDriverToken();
      const did = getDriverId();
      const data = await viajesApi.misViajes(did, estado, token);
      setMisViajes(data);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  useEffect(() => { if (driver) cargar(); }, [driver, estado]);

  if (!driver) return <div className="page container">Inicia sesión como conductor.</div>;

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Mis viajes</h1></div></div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="form-grid">
          <select className="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="borrador">Borradores</option>
          </select>
          <button className="btn" onClick={cargar}>Actualizar</button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Listado</h3>
        <ListaViajes viajes={misViajes} onSeleccionarViaje={() => {}} />
      </div>

      {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}