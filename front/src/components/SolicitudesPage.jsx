import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudes } from '../api';

export default function SolicitudesPage() {
  const { user, driver, getUserToken, getDriverToken, getUserId, getUserEmail, getDriverId } = useAuth();
  const [crear, setCrear] = useState({
    clienteId: '',
    clienteEmail: '',
    origen: '',
    destino: '',
    pasajeros: '',
  });
  const [clienteEmailHist, setClienteEmailHist] = useState('');
  const [historial, setHistorial] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [cotizar, setCotizar] = useState({ id: '', conductorId: '', precio: '' });
  const [actualizar, setActualizar] = useState({ id: '', estado: 'aceptada' });
  const [msg, setMsg] = useState('');

  const doCrear = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = getUserToken();
      const payload = {
        ...crear,
        clienteId: getUserId(),
        clienteEmail: getUserEmail(),
        pasajeros: Number(crear.pasajeros),
      };
      await solicitudes.crear(payload, token);
      setMsg(`Solicitud creada: ${payload.origen} → ${payload.destino} para ${payload.pasajeros} pasajero(s).`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarHistorial = async () => {
    setMsg('');
    try {
      const token = getUserToken();
      const data = await solicitudes.listarCliente(clienteEmailHist || getUserEmail(), token);
      setHistorial(data);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarPendientes = async () => {
    setMsg('');
    try {
      const token = getDriverToken();
      const data = await solicitudes.pendientesConductor(getDriverId(), token);
      setPendientes(data);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const doCotizar = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = getDriverToken();
      const payload = { conductorId: cotizar.conductorId, precio: Number(cotizar.precio) };
      const res = await solicitudes.cotizar(cotizar.id, payload, token);
      setMsg(`Cotizada id=${res.id} precio=${res.precio}`);
      cargarPendientes();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const doActualizar = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = getDriverToken() || getUserToken();
      const res = await solicitudes.actualizarEstado(actualizar.id, actualizar.estado, token);
      setMsg(`Solicitud ${res.id} estado=${res.status}`);
      cargarPendientes();
      cargarHistorial();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  // Autorrellenar datos del cliente (usuario)
  React.useEffect(() => {
    const uid = getUserId();
    const uemail = getUserEmail();
    setCrear((c) => ({
      ...c,
      clienteId: uid || '',
      clienteEmail: uemail || '',
    }));
    // También setear email para historial si está vacío
    setClienteEmailHist((prev) => prev || uemail || '');
  }, [getUserId, getUserEmail, user]);

  // Autorrellenar conductorId para cotizar
  React.useEffect(() => {
    const did = getDriverId();
    setCotizar((ct) => ({ ...ct, conductorId: did || '' }));
  }, [getDriverId, driver]);

  return (
    <div className="page container">
      <h2 className="section-title">Solicitudes</h2>

      <section className="card">
        <h3 className="section-title">Historial del cliente</h3>
        <div className="form-grid">
          <input className="input" placeholder="email del cliente" value={clienteEmailHist} onChange={(e) => setClienteEmailHist(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={cargarHistorial}>Buscar</button>
          </div>
        </div>
        <ul className="list" style={{ marginTop: 12 }}>
          {historial.map((s) => (
            <li key={s.id}>
              [{s.status}] {s.cliente_email} {s.origen} → {s.destino} pasajeros={s.pasajeros} {s.precio ? `precio=${s.precio}` : ''}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3 className="section-title">Pendientes del conductor</h3>
        {driver ? (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={cargarPendientes}>Recargar pendientes</button>
            </div>
            <ul className="list" style={{ marginTop: 12 }}>
              {pendientes.map((s) => (
                <li key={s.id}>
                  [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros} cliente={s.cliente_email}
                </li>
              ))}
            </ul>

            <form onSubmit={doCotizar} className="form-grid" style={{ marginTop: 12 }}>
              <h4 className="section-title">Cotizar</h4>
              <input className="input" placeholder="solicitudId" value={cotizar.id} onChange={(e) => setCotizar({ ...cotizar, id: e.target.value })} />
              <input className="input" placeholder="conductorId" value={cotizar.conductorId} readOnly />
              <input className="input" placeholder="precio" value={cotizar.precio} onChange={(e) => setCotizar({ ...cotizar, precio: e.target.value })} />
              <button type="submit" className="btn btn-primary">Cotizar</button>
            </form>

            <form onSubmit={doActualizar} className="form-grid" style={{ marginTop: 12 }}>
              <h4 className="section-title">Actualizar estado</h4>
              <input className="input" placeholder="solicitudId" value={actualizar.id} onChange={(e) => setActualizar({ ...actualizar, id: e.target.value })} />
              <select className="select" value={actualizar.estado} onChange={(e) => setActualizar({ ...actualizar, estado: e.target.value })}>
                <option value="aceptada">aceptada</option>
                <option value="rechazada">rechazada</option>
              </select>
              <button type="submit" className="btn btn-primary">Actualizar</button>
            </form>
          </>
        ) : (
          <div>Inicia sesión de conductor.</div>
        )}
      </section>

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}