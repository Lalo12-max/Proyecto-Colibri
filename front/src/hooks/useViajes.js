import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export function useViajes() {
  const [viajes, setViajes] = useState([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [criterios, setCriterios] = useState({ from: '', to: '', pasajeros: '1' });

  // Cargar viajes desde el backend
  const recargarViajes = async () => {
    const resp = await fetch(`${API_BASE}/viajes/disponibles`);
    const data = await resp.json();
    setViajes(Array.isArray(data) ? data : []);
  };

  // Llamada inicial
  useEffect(() => {
    recargarViajes().catch(() => {});
  }, []);

  const setCampoBusqueda = (campo, valor) => {
    setCriterios((prev) => ({ ...prev, [campo]: valor }));
  };

  const filtrarViajes = useMemo(() => {
    return viajes.filter((v) => {
      const matchFrom = criterios.from === '' || (v.from ?? '').toLowerCase().includes(criterios.from.toLowerCase());
      const matchTo = criterios.to === '' || (v.to ?? '').toLowerCase().includes(criterios.to.toLowerCase());
      const matchSeats =
        !criterios.pasajeros ||
        criterios.pasajeros === '' ||
        Number.isNaN(parseInt(criterios.pasajeros, 10)) ||
        (v.seats ?? 0) >= parseInt(criterios.pasajeros, 10);

      return matchFrom && matchTo && matchSeats;
    });
  }, [viajes, criterios]);

  const seleccionarViaje = (viaje) => setViajeSeleccionado(viaje);
  const cerrarDetalles = () => setViajeSeleccionado(null);

  return {
    viajes,
    viajeSeleccionado,
    criterios,
    filtrarViajes,
    setCampoBusqueda,
    seleccionarViaje,
    cerrarDetalles,
    recargarViajes,
  };
}