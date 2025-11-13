import { TarjetaViaje } from './TarjetaViaje';
import './style/lista-viajes.css';

export function ListaViajes({ viajes, onSeleccionarViaje }) {
  if (!viajes || viajes.length === 0) {
    return <div>No hay viajes disponibles con estos criterios</div>;
  }

  return (
    <div>
      <div className="lista-wrapper">
        {viajes.map((v) => (
          <div key={v.id}>
            <TarjetaViaje viaje={v} onVerDetalles={onSeleccionarViaje} />
          </div>
        ))}
      </div>
    </div>
  );
}