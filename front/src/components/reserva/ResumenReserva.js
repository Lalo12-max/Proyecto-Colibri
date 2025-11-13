import './style/resumen-reserva.css';

export function ResumenReserva() {
  const proxima = {
    ruta: 'Centro → Aeropuerto',
    fecha: '2024-01-22',
    hora: '07:45',
    pasajeros: 1,
    estado: 'Pendiente',
  };

  const historial = [
    { id: 'RS-2001', ruta: 'Barrio Norte → Centro', fecha: '2024-01-18', estado: 'Confirmada' },
    { id: 'RS-1992', ruta: 'Parque → Estación', fecha: '2024-01-12', estado: 'Completada' },
  ];

  return (
    <div className="res-card">
      <h3 className="res-title">Resumen de Reservas</h3>

      <div className="res-block">
        <h4 className="res-subtitle">Próxima Reserva</h4>
        <div className="res-item"><strong>Ruta:</strong> {proxima.ruta}</div>
        <div className="res-item"><strong>Fecha:</strong> {proxima.fecha} a las {proxima.hora}</div>
        <div className="res-item"><strong>Pasajeros:</strong> {proxima.pasajeros}</div>
        <div className="badge badge-primary">{proxima.estado}</div>
      </div>

      <div className="res-block">
        <h4 className="res-subtitle">Últimas Reservas</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {historial.map(r => (
            <div key={r.id} className="row">
              <span>{r.ruta}</span>
              <span style={{ color: '#6b7280' }}>{r.fecha}</span>
              <span className="chip">{r.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}