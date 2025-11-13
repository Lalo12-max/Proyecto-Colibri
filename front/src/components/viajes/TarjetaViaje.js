import { EstrellasValoracion } from './EstrellasValoracion';
import './style/tarjeta-viaje.css';

export function TarjetaViaje({ viaje, onVerDetalles }) {
  return (
    <div className="viaje-card">
      <div className="viaje-ruta">
        <span className="viaje-bold">{viaje.from}</span> → <span className="viaje-bold">{viaje.to}</span>
      </div>
      <div className="viaje-detalles">
        <div>Fecha: {viaje.date}</div>
        {viaje.price !== undefined && viaje.price !== null && (
          <div>Precio: {viaje.price}€</div>
        )}
        <div>Plazas: {viaje.seats}</div>
        <div>Conductor: {viaje.driver}</div>
        <div style={{ marginTop: 4 }}>
          <EstrellasValoracion rating={viaje.rating} />
        </div>
      </div>
      <button className="viaje-btn" onClick={() => onVerDetalles(viaje)}>
        Ver Detalles
      </button>
    </div>
  );
}