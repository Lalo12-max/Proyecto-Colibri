import { useMemo, useState } from 'react';

export function useViajesReservas() {
  // ... existing code ...
  const [viajes, setViajes] = useState([
    {
      id: 1,
      from: 'Madrid',
      to: 'Barcelona',
      date: '2023-06-15',
      time: '08:00',
      price: 25,
      seats: 3,
      driver: 'Carlos',
    },
    {
      id: 2,
      from: 'Valencia',
      to: 'Sevilla',
      date: '2023-06-16',
      time: '09:30',
      price: 30,
      seats: 2,
      driver: 'Ana',
    },
    {
      id: 3,
      from: 'Bilbao',
      to: 'Madrid',
      date: '2023-06-17',
      time: '18:15',
      price: 22,
      seats: 4,
      driver: 'Miguel',
    },
  ]);

  const [criterios, setCriterios] = useState({
    from: '',
    to: '',
    pasajeros: '1',
    dia: '',
    hora: '',
  });

  const setCampoBusqueda = (campo, valor) => {
    setCriterios((prev) => ({ ...prev, [campo]: valor }));
  };

  const filtrarReservas = useMemo(() => {
    return viajes.filter((v) => {
      const matchFrom =
        criterios.from === '' ||
        v.from.toLowerCase().includes(criterios.from.toLowerCase());

      const matchTo =
        criterios.to === '' ||
        v.to.toLowerCase().includes(criterios.to.toLowerCase());

      const matchSeats =
        !criterios.pasajeros ||
        criterios.pasajeros === '' ||
        Number.isNaN(parseInt(criterios.pasajeros, 10)) ||
        v.seats >= parseInt(criterios.pasajeros, 10);

      const matchDia = criterios.dia === '' || v.date === criterios.dia;
      const matchHora = criterios.hora === '' || v.time === criterios.hora;

      return matchFrom && matchTo && matchSeats && matchDia && matchHora;
    });
  }, [viajes, criterios]);

  return {
    viajes,
    criterios,
    filtrarReservas,
    setCampoBusqueda,
  };
  // ... existing code ...
}