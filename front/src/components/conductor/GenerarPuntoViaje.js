import React from 'react';

export function GenerarPuntoViaje({ onGenerar }) {
  const [puntoSalida, setPuntoSalida] = React.useState('');
  const [plazas, setPlazas] = React.useState('1');
  const [zonaNombre, setZonaNombre] = React.useState('');
  const [referenciaTexto, setReferenciaTexto] = React.useState('');
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');

  const publicar = () => {
    onGenerar?.({ puntoSalida, plazas, zonaNombre, referenciaTexto, lat, lng });
    setPuntoSalida('');
    setPlazas('1');
    setZonaNombre('');
    setReferenciaTexto('');
    setLat('');
    setLng('');
  };

  return (
    <div className="card">
      <h2 className="section-title">Generar un punto de viaje</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        <div className="input-wrap">
          <label className="input-label">🏷️ Nombre de la zona</label>
          <input
            className="auth-input"
            placeholder="Ej. Plaza Principal"
            value={zonaNombre}
            onChange={(e) => setZonaNombre(e.target.value)}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label">📝 Referencia</label>
          <input
            className="auth-input"
            placeholder="Ej. Frente a la iglesia, junto a la fuente"
            value={referenciaTexto}
            onChange={(e) => setReferenciaTexto(e.target.value)}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label">🧭 Punto de salida</label>
          <input
            className="auth-input"
            placeholder="Ej. Mercado Central"
            value={puntoSalida}
            onChange={(e) => setPuntoSalida(e.target.value)}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label">👥 Plazas</label>
          <input
            className="auth-input"
            type="number"
            min="1"
            max="6"
            value={plazas}
            onChange={(e) => setPlazas(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="input-wrap">
            <label className="input-label">📍 Lat</label>
            <input className="auth-input" placeholder="19.123" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div className="input-wrap">
            <label className="input-label">📍 Lng</label>
            <input className="auth-input" placeholder="-99.123" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
        </div>
        <button className="auth-btn" onClick={publicar}>Publicar punto</button>
        <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          Los clientes podrán reservar desde este punto y elegir su destino.
        </p>
      </div>
    </div>
  );
}