export function PublicarFormulario({ nuevoViaje, setCampo, onPublicar }) {
  return (
    <div style={styles.contenedor}>
      <h2>Publicar un Viaje</h2>

      <div style={styles.grupo}>
        <h3 style={styles.subtitulo}>Información del Viaje</h3>
        <input style={styles.input} placeholder="Origen" value={nuevoViaje.from} onChange={(e) => setCampo('from', e.target.value)} />
        <input style={styles.input} placeholder="Destino" value={nuevoViaje.to} onChange={(e) => setCampo('to', e.target.value)} />
        <input style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={nuevoViaje.date} onChange={(e) => setCampo('date', e.target.value)} />
        <input style={styles.input} placeholder="Precio (€)" value={nuevoViaje.price} onChange={(e) => setCampo('price', e.target.value)} />
        <input style={styles.input} placeholder="Plazas disponibles" value={nuevoViaje.seats} onChange={(e) => setCampo('seats', e.target.value)} />
      </div>

      <div style={styles.grupo}>
        <h3 style={styles.subtitulo}>Información del Conductor y Vehículo</h3>
        <input style={styles.input} placeholder="Tu nombre" value={nuevoViaje.driver} onChange={(e) => setCampo('driver', e.target.value)} />
        <input style={styles.input} placeholder="Placa del vehículo" value={nuevoViaje.licensePlate} onChange={(e) => setCampo('licensePlate', e.target.value)} />
        <input style={styles.input} placeholder="Modelo del coche" value={nuevoViaje.car} onChange={(e) => setCampo('car', e.target.value)} />
      </div>

      <button style={styles.boton} onClick={onPublicar}>
        Publicar Viaje
      </button>
    </div>
  );
}

const styles = {
  contenedor: { border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff' },
  grupo: { marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  subtitulo: { margin: 0, fontSize: 16 },
  input: { padding: 8, borderRadius: 6, border: '1px solid #ccc' },
  boton: { marginTop: 8, padding: '8px 12px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
};