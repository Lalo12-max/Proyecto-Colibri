import React from 'react';
import { RouteMap } from './map/RouteMap';

export default function TurismoPage() {
  const paquetes = [
    {
      id: 1,
      titulo: 'Paquete turismo 1',
      descripcion: 'Incluye visita al Sótano del Barro y Misión de Concá (ida y vuelta).',
      precio: 300,
      icon: '🚌',
      origen: '21.5458,-99.6894',           // Central de Autobuses (Cabecera Municipal)
      destino: '21.3107,-99.6679',          // Sótano del Barro
      detalles: {
        duracion: '8 horas',
        salida: '08:00',
        incluye: ['Transporte ida/vuelta', 'Paradas en Sótano del Barro y Misión de Concá'],
        noIncluye: ['Alimentos', 'Entradas a sitios (si aplican)'],
        recomendacion: 'Llevar calzado cómodo y agua.',
      },
    },
    {
      id: 2,
      titulo: 'Sierra Gorda Clásico',
      descripcion: 'Las Adjuntas + Árbol Milenario + Arte Rupestre (ida y vuelta).',
      precio: 450,
      icon: '🌄',
      origen: '21.5458,-99.6894',
      destino: '21.4782,-99.5204',          // Las Adjuntas
      detalles: {
        duracion: '9 horas',
        salida: '07:30',
        incluye: ['Transporte', 'Paradas en Las Adjuntas, Árbol Milenario y Arte Rupestre'],
        noIncluye: ['Comidas'],
        recomendacion: 'Traer traje de baño si planea meterse al agua.',
      },
    },
    {
      id: 3,
      titulo: 'Aventura Acuática',
      descripcion: 'Balneario Abanico + Las Adjuntas. Ideal para grupos.',
      precio: 380,
      icon: '💦',
      origen: '21.5458,-99.6894',
      destino: '21.5209,-99.6498',          // Balneario Abanico
      detalles: {
        duracion: '7 horas',
        salida: '09:00',
        incluye: ['Transporte', 'Tiempo libre Balneario Abanico y Las Adjuntas'],
        noIncluye: ['Entradas', 'Alimentos'],
        recomendacion: 'Bloqueador solar y toalla.',
      },
    },
    {
      id: 4,
      titulo: 'Ruta Cultural',
      descripcion: 'Misión de Concá + Zona Arqueológica / Arte Rupestre.',
      precio: 320,
      icon: '⛪',
      origen: '21.5458,-99.6894',
      destino: '21.5236,-99.6521',          // Misión de Concá
      detalles: {
        duracion: '6 horas',
        salida: '10:00',
        incluye: ['Transporte', 'Visita guiada básica a Misión de Concá y Arte Rupestre'],
        noIncluye: ['Entradas'],
        recomendacion: 'Respeto a zonas protegidas y patrimonio.',
      },
    },
  ];

  const [msg, setMsg] = React.useState('');
  const [openId, setOpenId] = React.useState(null);

  const reservar = (p) => {
    setMsg(`Has seleccionado: ${p.titulo} por $${p.precio} MXN`);
  };

  return (
    <div className="page container">
      <div className="app-header">
        <div className="brand"><h1>Turismo</h1></div>
      </div>

      <section className="card">
        <h3 className="section-title">Paquetes disponibles</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {paquetes.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.titulo}</div>
                  <div style={{ color: 'var(--color-muted)' }}>{p.descripcion}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 700 }}>${p.precio} MXN</div>
              </div>

              {/* Mini mapa del recorrido */}
              <div style={{ marginTop: 10 }}>
                <RouteMap origen={p.origen} destino={p.destino} height={220} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => reservar(p)}>Reservar</button>
                <button className="btn" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                  {openId === p.id ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>

              {openId === p.id && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Detalles</div>
                  <ul className="list">
                    <li>Duración: {p.detalles.duracion}</li>
                    <li>Hora de salida: {p.detalles.salida}</li>
                    <li>Incluye: {p.detalles.incluye.join(', ')}</li>
                    <li>No incluye: {p.detalles.noIncluye.join(', ')}</li>
                    <li>Recomendación: {p.detalles.recomendacion}</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        {msg && <div style={{ marginTop: 12, color: 'var(--color-muted)' }}>{msg}</div>}
      </section>
    </div>
  );
}