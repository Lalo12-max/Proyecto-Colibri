import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { viajes } from '../api';

export default function ViajesPage() {
  const { user, getUserToken, driver, getDriverToken, getUserId, getDriverId } = useAuth();
  const [disponibles, setDisponibles] = useState([]);
  const [catalogo, setCatalogo] = useState({ fechas: [], catalogo: {} });
  const [fechaCatalogo, setFechaCatalogo] = useState('');
  const [nuevoViaje, setNuevoViaje] = useState({
    usuarioId: '',
    origen: '',
    destino: '',
    fecha: '',
    hora: '',
    precio: '',
    plazas: '',
    coche: '',
    matricula: '',
  });
  const [nuevoPunto, setNuevoPunto] = useState({
    conductorId: '',
    puntoSalida: '',
    plazas: '',
  });
  const [msg, setMsg] = useState('');

  const cargarDisponibles = async () => {
    const data = await viajes.disponibles();
    setDisponibles(data);
  };

  const cargarCatalogo = async () => {
    const data = await viajes.catalogo(fechaCatalogo || undefined);
    setCatalogo(data);
  };

  useEffect(() => {
    cargarDisponibles();
    cargarCatalogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crearViaje = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = getUserToken();
      const payload = { ...nuevoViaje, precio: Number(nuevoViaje.precio), plazas: Number(nuevoViaje.plazas) };
      await viajes.crear(payload, token);
      setMsg(`Viaje publicado: ${payload.origen} → ${payload.destino} el ${payload.fecha} a las ${payload.hora}.`);
      cargarDisponibles();
      cargarCatalogo();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const crearPunto = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = getDriverToken();
      const payload = { ...nuevoPunto, plazas: Number(nuevoPunto.plazas) };
      await viajes.crearPunto(payload, token);
      setMsg(`Punto creado: ${payload.puntoSalida} (${payload.plazas} plazas).`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    // Autorrellenar usuarioId desde sesión de usuario
    const uid = getUserId();
    if (uid) {
      setNuevoViaje((v) => ({ ...v, usuarioId: uid }));
    }
  }, [getUserId, user]);

  useEffect(() => {
    // Autorrellenar conductorId desde sesión de conductor
    const did = getDriverId();
    if (did) {
      setNuevoViaje((v) => ({ ...v, conductorId: did }));
      setNuevoPunto((p) => ({ ...p, conductorId: did }));
    }
  }, [getDriverId, driver]);

  return (
    <div className="page container">
      <div className="app-header">
        <div className="brand"><h1>Viajes</h1></div>
      </div>

      <section className="card">
        <h3 className="section-title">Disponibles</h3>
        <button className="btn" onClick={cargarDisponibles}>Recargar</button>
        <ul className="list" style={{ marginTop: 12 }}>
          {disponibles.map((v) => (
            <li key={v.id}>
              {v.from} → {v.to} | {v.date} {v.time} | {v.seats} plazas | {v.price}€ | Conductor: {v.driver}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3 className="section-title">Catálogo por fecha</h3>
        <div className="form-grid">
          <input className="input" placeholder="YYYY-MM-DD" value={fechaCatalogo} onChange={(e) => setFechaCatalogo(e.target.value)} />
          <button className="btn" onClick={cargarCatalogo}>Filtrar</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {catalogo.fechas?.map((f) => (
            <div key={f} className="card">
              <strong>{f}</strong>
              <ul className="list" style={{ marginTop: 8 }}>
                {(catalogo.catalogo?.[f] || []).map((v) => (
                  <li key={v.id}>
                    {v.from} → {v.to} | {v.time} | {v.seats} plazas | {v.price}€ | Conductor: {v.driver}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Publicar viaje (conductor)</h3>
        {driver ? (
          <form onSubmit={crearViaje} className="form-grid">
            <input
              className="input"
              placeholder="conductorId"
              value={nuevoViaje.conductorId}
              readOnly
              title="Autorrellenado desde tu sesión de conductor"
            />
            <input className="input" placeholder="origen" value={nuevoViaje.origen} onChange={(e) => setNuevoViaje({ ...nuevoViaje, origen: e.target.value })} />
            <input className="input" placeholder="destino" value={nuevoViaje.destino} onChange={(e) => setNuevoViaje({ ...nuevoViaje, destino: e.target.value })} />
            <input className="input" placeholder="fecha (YYYY-MM-DD)" value={nuevoViaje.fecha} onChange={(e) => setNuevoViaje({ ...nuevoViaje, fecha: e.target.value })} />
            <input className="input" placeholder="hora (HH:mm)" value={nuevoViaje.hora} onChange={(e) => setNuevoViaje({ ...nuevoViaje, hora: e.target.value })} />
            <input className="input" placeholder="precio" value={nuevoViaje.precio} onChange={(e) => setNuevoViaje({ ...nuevoViaje, precio: e.target.value })} />
            <input className="input" placeholder="plazas" value={nuevoViaje.plazas} onChange={(e) => setNuevoViaje({ ...nuevoViaje, plazas: e.target.value })} />
            <input className="input" placeholder="coche" value={nuevoViaje.coche} onChange={(e) => setNuevoViaje({ ...nuevoViaje, coche: e.target.value })} />
            <input className="input" placeholder="matricula" value={nuevoViaje.matricula} onChange={(e) => setNuevoViaje({ ...nuevoViaje, matricula: e.target.value })} />
            <button type="submit" className="btn btn-primary">Publicar viaje</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para publicar viaje.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Crear punto (conductor)</h3>
        {driver ? (
          <form onSubmit={crearPunto} className="form-grid">
            <input
              className="input"
              placeholder="conductorId"
              value={nuevoPunto.conductorId}
              readOnly
              title="Autorrellenado desde tu sesión de conductor"
            />
            <input className="input" placeholder="puntoSalida" value={nuevoPunto.puntoSalida} onChange={(e) => setNuevoPunto({ ...nuevoPunto, puntoSalida: e.target.value })} />
            <input className="input" placeholder="plazas" value={nuevoPunto.plazas} onChange={(e) => setNuevoPunto({ ...nuevoPunto, plazas: e.target.value })} />
            <button type="submit" className="btn btn-primary">Crear punto</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para crear punto.</div>
        )}
      </section>

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}