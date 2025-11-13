import React from 'react';
import './style/buscar-reserva.css';

export function BuscarReserva({ criterios, setCampo, onSolicitar }) {
  const [dia, setDia] = React.useState('');
  const [hora, setHora] = React.useState('');

  const solicitar = () => {
    onSolicitar?.({
      ...criterios,
      dia,
      hora,
    });
  };

  return (
    <div className="reserva-card">
      <div className="reserva-form">
        <div className="input-wrap">
          <label className="input-label">📌 Lugar de recogida</label>
          <input
            className="reserva-input"
            placeholder="Lugar de recogida"
            value={criterios.from}
            onChange={(e) => setCampo('from', e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">📌 Destino</label>
          <input
            className="reserva-input"
            placeholder="Destino"
            value={criterios.to}
            onChange={(e) => setCampo('to', e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">🧒 Pasajeros</label>
          <input
            className="reserva-input pasajeros-input"
            type="number"
            min="1"
            max="6"
            placeholder="1"
            value={criterios.pasajeros}
            onChange={(e) => setCampo('pasajeros', e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">📅 Día</label>
          <input
            className="reserva-input"
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">⏰ Hora</label>
          <input
            className="reserva-input"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>

        <button className="reserva-btn" onClick={solicitar}>
          Solicitar Reserva 🚗
        </button>
      </div>
    </div>
  );
}