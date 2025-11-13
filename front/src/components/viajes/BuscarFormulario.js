import './style/buscar-formulario.css';

export function BuscarFormulario({ criterios, setCampo, onSolicitar }) {
  return (
    <div className="buscar-card">
      <div className="buscar-form">
        <div className="input-wrap">
          <label className="input-label">📌 Lugar de recogida</label>
          <input
            className="buscar-input"
            placeholder="Lugar de recogida"
            value={criterios.from}
            onChange={(e) => setCampo('from', e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">📌 Destino</label>
          <input
            className="buscar-input"
            placeholder="Destino"
            value={criterios.to}
            onChange={(e) => setCampo('to', e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <label className="input-label">🧒 Pasajeros</label>
          <input
            className="buscar-input pasajeros-input"
            type="number"
            min="1"
            max="6"
            placeholder="1"
            value={criterios.pasajeros}
            onChange={(e) => setCampo('pasajeros', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}