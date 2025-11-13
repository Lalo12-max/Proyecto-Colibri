import './style/resumen-cliente.css';

export function ResumenCliente() {
  const proximaReserva = {
    ruta: 'Hotel Plaza Mayor → Aeropuerto',
    fecha: '2024-01-20',
    hora: '08:00',
    pasajeros: 2,
    estado: 'Confirmada',
  };

  const ultimasReservas = [
    { id: 'R-1024', ruta: 'Centro → Universidad', fecha: '2024-01-18', estado: 'Pendiente' },
    { id: 'R-1018', ruta: 'Estación → Casa', fecha: '2024-01-12', estado: 'Completada' },
  ];

  return (
    <div className="cliente-card">
      <h3 className="cliente-title">Resumen del Cliente</h3>

      <div className="cliente-block">
        <h4 className="cliente-subtitle">Próxima Reserva</h4>
        <div className="cliente-item"><strong>Ruta:</strong> {proximaReserva.ruta}</div>
        <div className="cliente-item"><strong>Fecha:</strong> {proximaReserva.fecha} a las {proximaReserva.hora}</div>
        <div className="cliente-item"><strong>Pasajeros:</strong> {proximaReserva.pasajeros}</div>
        <div className="badge badge-primary">{proximaReserva.estado}</div>
      </div>

      <div className="cliente-block">
        <h4 className="cliente-subtitle">Últimas Reservas</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {ultimasReservas.map(r => (
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