import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { viajes as viajesApi, solicitudes as solicitudesApi } from '../api';

export default function DriverPuntosPage() {
  const { driver, driverSession } = useAuth();
  const [msg, setMsg] = useState('');
  const [nuevoPunto, setNuevoPunto] = useState({ conductorId: '', zonaNombre: '', referenciaTexto: '', puntoSalida: '', plazas: '', lat: '', lng: '', precio_base: '' });
  const [misPuntos, setMisPuntos] = useState([]);
  const [pendientesPunto, setPendientesPunto] = useState([]);

  useEffect(() => {
    const did = driver?.id || '';
    if (did) setNuevoPunto((p) => ({ ...p, conductorId: did }));
  }, [driver]);

  const cargarMisPuntos = useCallback(async () => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      const data = await viajesApi.misPuntos(did, token);
      setMisPuntos(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [driverSession, driver]);

  const crearPunto = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const payload = {
        conductorId: nuevoPunto.conductorId,
        zonaNombre: nuevoPunto.zonaNombre || undefined,
        referenciaTexto: nuevoPunto.referenciaTexto || undefined,
        puntoSalida: nuevoPunto.puntoSalida || undefined,
        plazas: Number(nuevoPunto.plazas),
        lat: nuevoPunto.lat ? parseFloat(nuevoPunto.lat) : undefined,
        lng: nuevoPunto.lng ? parseFloat(nuevoPunto.lng) : undefined,
        precio_base: nuevoPunto.precio_base ? Number(nuevoPunto.precio_base) : undefined,
      };
      await viajesApi.crearPunto(payload, token);
      setMsg('Punto creado');
      cargarMisPuntos();
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const cargarSolicitudesPunto = useCallback(async () => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      const data = await solicitudesApi.delConductor(did, token);
      const filtradas = (Array.isArray(data) ? data : []).filter((s) => (s.tipo ? s.tipo === 'punto' : s.puntoId));
      setPendientesPunto(filtradas.filter((s) => s.status === 'pendiente'));
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }, [driverSession, driver]);

  const aceptar = async (id) => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      const did = driver?.id || null;
      await solicitudesApi.aceptar(id, did, token);
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const rechazar = async (id) => {
    setMsg('');
    try {
      const token = driverSession?.access_token || null;
      await solicitudesApi.rechazar(id, token);
      cargarSolicitudesPunto();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  useEffect(() => { if (driver) { cargarMisPuntos(); cargarSolicitudesPunto(); } }, [driver, driverSession, cargarMisPuntos, cargarSolicitudesPunto]);

  return (
    <div className="page container">
      <h2 className="section-title">Mis puntos</h2>

      <section className="card">
        <h3 className="section-title">Crear punto</h3>
        {driver ? (
          <form onSubmit={crearPunto} className="form-grid">
            <input className="input" placeholder="Nombre del neuvo punto" value={nuevoPunto.zonaNombre} onChange={(e) => setNuevoPunto({ ...nuevoPunto, zonaNombre: e.target.value })} />
            <input className="input" placeholder="referencia (Descripción)" value={nuevoPunto.referenciaTexto} onChange={(e) => setNuevoPunto({ ...nuevoPunto, referenciaTexto: e.target.value })} />
            <input className="input" placeholder="Punto de Salida" value={nuevoPunto.puntoSalida} onChange={(e) => setNuevoPunto({ ...nuevoPunto, puntoSalida: e.target.value })} />
            <input className="input" placeholder="Plazas disponibles" value={nuevoPunto.plazas} onChange={(e) => setNuevoPunto({ ...nuevoPunto, plazas: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/*<input className="input" placeholder="lat" value={nuevoPunto.lat} onChange={(e) => setNuevoPunto({ ...nuevoPunto, lat: e.target.value })} />*/}
              {/*<input className="input" placeholder="lng" value={nuevoPunto.lng} onChange={(e) => setNuevoPunto({ ...nuevoPunto, lng: e.target.value })} />*/}
            </div>
            <input className="input" placeholder="Precio base por plaza (Primeros 5km)" value={nuevoPunto.precio_base} onChange={(e) => setNuevoPunto({ ...nuevoPunto, precio_base: e.target.value })} />
            <button type="submit" className="btn btn-primary">Crear punto</button>
          </form>
        ) : (
          <div>Inicia sesión de conductor para crear punto.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Solicitudes por punto activo</h3>
        {driver ? (
          <>
            <button className="btn" onClick={cargarSolicitudesPunto}>Recargar</button>
            <ul className="list" style={{ marginTop: 12 }}>
              {pendientesPunto.map((s) => (
                <li key={s.id}>
                  [{s.status}] {s.origen} → {s.destino} pasajeros={s.pasajeros} cliente={s.cliente_email}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn btn-primary" onClick={() => aceptar(s.id)}>Aceptar</button>
                    <button className="btn btn-secondary" onClick={() => rechazar(s.id)}>Rechazar</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Inicia sesión de conductor para ver solicitudes.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Mis puntos</h3>
        {driver ? (
          <>
            <button className="btn" onClick={cargarMisPuntos}>Recargar</button>
            <ul className="list" style={{ marginTop: 12 }}>
              {misPuntos.map((v) => (
                <li key={v.id}>
                  {v.from} | Plazas: {v.seats} | Precio: {v.price}€
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Inicia sesión de conductor para ver tus puntos.</div>
        )}
      </section>

      {msg && <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>{msg}</div>}
    </div>
  );
}