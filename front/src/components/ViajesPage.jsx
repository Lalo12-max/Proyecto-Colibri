import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { viajes } from '../api';
import { ListaViajes } from './viajes/ListaViajes';

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
    zonaNombre: '',
    referenciaTexto: '',
    lat: '',
    lng: '',
    precio_base: '',
  });
  const [misPuntos, setMisPuntos] = useState([]);
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
      const payload = {
        conductorId: nuevoPunto.conductorId,
        puntoSalida: nuevoPunto.puntoSalida,
        plazas: Number(nuevoPunto.plazas),
        zonaNombre: nuevoPunto.zonaNombre || undefined,
        referenciaTexto: nuevoPunto.referenciaTexto || undefined,
        lat: nuevoPunto.lat ? parseFloat(nuevoPunto.lat) : undefined,
        lng: nuevoPunto.lng ? parseFloat(nuevoPunto.lng) : undefined,
        precio_base: nuevoPunto.precio_base ? Number(nuevoPunto.precio_base) : undefined,
      };
      await viajes.crearPunto(payload, token);
      setMsg(`Punto creado: ${payload.zonaNombre || payload.puntoSalida} (${payload.plazas} plazas).`);
      cargarMisPuntos();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarMisPuntos = async () => {
    try {
      const token = getDriverToken();
      const did = getDriverId();
      if (!did) return;
      const data = await viajes.misViajes(did, 'punto', token);
      setMisPuntos(data);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Disponibles</h3>
          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
            {disponibles.length} viajes
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={cargarDisponibles}>Recargar</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <ListaViajes viajes={disponibles} onSeleccionarViaje={() => {}} />
        </div>
      </section>
      {false && (
      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Catálogo por fecha</h3>
        <div className="form-grid">
          <select
            className="select"
            value={fechaCatalogo}
            onChange={(e) => setFechaCatalogo(e.target.value)}
          >
            <option value="">Todas</option>
            {(catalogo.fechas || []).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button className="btn" onClick={cargarCatalogo}>Recargar catálogo</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {(fechaCatalogo ? (catalogo.catalogo[fechaCatalogo] || []) : (catalogo.fechas || []).flatMap((f) => catalogo.catalogo[f] || [])).length === 0 ? (
            <div>No hay viajes en el catálogo para la selección</div>
          ) : (
            <ul className="list">
              {(fechaCatalogo ? (catalogo.catalogo[fechaCatalogo] || []) : (catalogo.fechas || []).flatMap((f) => catalogo.catalogo[f] || [])).map((v) => (
                <li key={v.id}>
                  {v.from} → {v.to} | {v.time} | {v.seats} plazas | {v.price}€ | Conductor: {v.driver}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      )}

      {false && (
      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Crear viaje (conductor)</h3>
        {driver ? (
          <form onSubmit={crearViaje} className="form-grid">
            <input className="input" placeholder="conductorId" value={nuevoViaje.conductorId || ''} readOnly />
            <input className="input" placeholder="origen" value={nuevoViaje.origen} onChange={(e) => setNuevoViaje({ ...nuevoViaje, origen: e.target.value })} />
            <input className="input" placeholder="destino" value={nuevoViaje.destino} onChange={(e) => setNuevoViaje({ ...nuevoViaje, destino: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input" placeholder="fecha (YYYY-MM-DD)" value={nuevoViaje.fecha} onChange={(e) => setNuevoViaje({ ...nuevoViaje, fecha: e.target.value })} />
              <input className="input" placeholder="hora (HH:MM)" value={nuevoViaje.hora} onChange={(e) => setNuevoViaje({ ...nuevoViaje, hora: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input" placeholder="precio" value={nuevoViaje.precio} onChange={(e) => setNuevoViaje({ ...nuevoViaje, precio: e.target.value })} />
              <input className="input" placeholder="plazas" value={nuevoViaje.plazas} onChange={(e) => setNuevoViaje({ ...nuevoViaje, plazas: e.target.value })} />
            </div>
            <input className="input" placeholder="coche (opcional)" value={nuevoViaje.coche} onChange={(e) => setNuevoViaje({ ...nuevoViaje, coche: e.target.value })} />
            <input className="input" placeholder="matricula (opcional)" value={nuevoViaje.matricula} onChange={(e) => setNuevoViaje({ ...nuevoViaje, matricula: e.target.value })} />
            <button type="submit" className="btn btn-primary">Publicar viaje</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para publicar un viaje.</div>
        )}
      </section>
      )}
      {false && (
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
            <input className="input" placeholder="zonaNombre" value={nuevoPunto.zonaNombre} onChange={(e) => setNuevoPunto({ ...nuevoPunto, zonaNombre: e.target.value })} />
            <input className="input" placeholder="referenciaTexto" value={nuevoPunto.referenciaTexto} onChange={(e) => setNuevoPunto({ ...nuevoPunto, referenciaTexto: e.target.value })} />
            <input className="input" placeholder="puntoSalida (opcional)" value={nuevoPunto.puntoSalida} onChange={(e) => setNuevoPunto({ ...nuevoPunto, puntoSalida: e.target.value })} />
            <input className="input" placeholder="plazas" value={nuevoPunto.plazas} onChange={(e) => setNuevoPunto({ ...nuevoPunto, plazas: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input" placeholder="lat (opcional)" value={nuevoPunto.lat} onChange={(e) => setNuevoPunto({ ...nuevoPunto, lat: e.target.value })} />
              <input className="input" placeholder="lng (opcional)" value={nuevoPunto.lng} onChange={(e) => setNuevoPunto({ ...nuevoPunto, lng: e.target.value })} />
            </div>
            <input className="input" placeholder="precio_base (opcional)" value={nuevoPunto.precio_base} onChange={(e) => setNuevoPunto({ ...nuevoPunto, precio_base: e.target.value })} />
            {nuevoPunto.lat && nuevoPunto.lng ? (
              (() => {
                const token = process.env.REACT_APP_MAPBOX_TOKEN || '';
                const lat = Number(nuevoPunto.lat);
                const lng = Number(nuevoPunto.lng);
                const zoom = 14;
                const url = token
                  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/600x300?access_token=${token}`
                  : `https://www.openstreetmap.org/export/embed.html?bbox=${(lng-0.01).toFixed(5)}%2C${(lat-0.01).toFixed(5)}%2C${(lng+0.01).toFixed(5)}%2C${(lat+0.01).toFixed(5)}&layer=mapnik&marker=${lat}%2C${lng}`;
                return (
                  <div style={{ marginTop: 8 }}>
                    {token ? (
                      <img src={url} alt="Mapa" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                    ) : (
                      <iframe title="Mapa" src={url} style={{ width: '100%', height: 300, border: 0, borderRadius: 8 }} />
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`, '_blank', 'noopener,noreferrer')}
                      >Abrir en OSM</button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer')}
                      >Abrir en Google Maps</button>
                    </div>
                  </div>
                );
              })()
            ) : null}
            <button type="submit" className="btn btn-primary">Crear punto</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para crear punto.</div>
        )}
      </section>
      )}

      {false && (
      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Mis puntos (conductor)</h3>
        {driver ? (
          <>
            <button className="btn" onClick={cargarMisPuntos}>Recargar</button>
            <ul className="list" style={{ marginTop: 12 }}>
              {misPuntos.map((v) => (
                <li key={v.id}>
                  {v.from} | Plazas: {v.seats} | Precio: {v.price}€
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button type="button" className="btn" onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(v.from)}`,'_blank','noopener,noreferrer')}>OSM</button>
                    <button type="button" className="btn" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.from)}`,'_blank','noopener,noreferrer')}>Google Maps</button>
                    <button type="button" className="btn" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.from)}`,'_blank','noopener,noreferrer')}>Cómo llegar</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Inicia sesión de conductor para ver tus puntos.</div>
        )}
      </section>
      )}

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}