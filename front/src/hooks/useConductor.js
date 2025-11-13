import { useState } from 'react';

export function useConductor() {
  const [viajesConductor, setViajesConductor] = useState([]);
  const [nuevoViaje, setNuevoViaje] = useState({
    from: '',
    to: '',
    date: '',
    price: '',
    seats: '',
    driver: 'Tú',
    licensePlate: '',
    car: '',
    driverPhoto: 'https://randomuser.me/api/portraits/lego/1.jpg',
    carPhoto:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    rating: 0,
  });

  const setCampoNuevoViaje = (campo, valor) => {
    setNuevoViaje((prev) => ({ ...prev, [campo]: valor }));
  };

  const agregarViaje = () => {
    const viaje = {
      id: viajesConductor.length + 1,
      from: nuevoViaje.from,
      to: nuevoViaje.to,
      date: nuevoViaje.date,
      price: parseFloat(nuevoViaje.price || '0'),
      seats: parseInt(nuevoViaje.seats || '1', 10),
      driver: nuevoViaje.driver,
      licensePlate: nuevoViaje.licensePlate,
      car: nuevoViaje.car,
      driverPhoto: nuevoViaje.driverPhoto,
      carPhoto: nuevoViaje.carPhoto,
      rating: 0,
    };
    setViajesConductor((prev) => [...prev, viaje]);
    setNuevoViaje((prev) => ({ ...prev, from: '', to: '', date: '', price: '', seats: '' }));
  };

  const agregarPuntoViaje = async ({ puntoSalida, plazas, conductor }) => {
    console.log('[agregarPuntoViaje] args:', { puntoSalida, plazas, conductor });

    if (!conductor?.user?.id) {
      console.warn('[agregarPuntoViaje] conductor missing user.id', { conductor });
      throw new Error('Debes iniciar sesión como conductor.');
    }

    const payload = {
      conductorId: conductor.user.id,
      puntoSalida,
      plazas,
      // car, licensePlate y rating se generan en el backend
    };
    console.log('[agregarPuntoViaje] POST /puntos payload:', payload);

    const resp = await fetch('http://localhost:4000/puntos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('[agregarPuntoViaje] response status:', resp.status);

    if (!resp.ok) {
      let errBody = {};
      try {
        errBody = await resp.json();
      } catch (_e) {}
      console.error('[agregarPuntoViaje] backend error body:', errBody);
      throw new Error(errBody?.error ?? `Error al publicar el punto (status ${resp.status})`);
    }

    const nuevo = await resp.json();
    console.log('[agregarPuntoViaje] created:', nuevo);

    setViajesConductor((prev) => [
      ...prev,
      {
        id: nuevo.id,
        from: nuevo.punto_salida,
        to: 'A definir',
        date: (nuevo.created_at || '').slice(0, 10),
        seats: nuevo.plazas,
        driver: nuevo.conductor_nombre,
        rating: nuevo.rating ?? 0,
      },
    ]);

    return nuevo;
  };

  return {
    viajesConductor,
    nuevoViaje,
    setCampoNuevoViaje,
    agregarViaje,
    agregarPuntoViaje,
  };
}