import { useRef, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export function useSolicitudes() {
  const [pendientesConductor, setPendientesConductor] = useState([]);
  const [delCliente, setDelCliente] = useState([]);
  const pollerRef = useRef(null);

  const crearSolicitudCliente = async ({ clienteId, clienteEmail, origen, destino, pasajeros }) => {
    const resp = await fetch(`${API_BASE}/solicitudes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, clienteEmail, origen, destino, pasajeros }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.error || 'Error al crear solicitud');
    return json;
  };

  const listarPendientesConductor = async (conductorId) => {
    const resp = await fetch(`${API_BASE}/solicitudes/conductor/${conductorId}`);
    const json = await resp.json();
    setPendientesConductor(Array.isArray(json) ? json : []);
    return json;
  };

  const cotizarSolicitud = async ({ solicitudId, conductorId, precio }) => {
    const resp = await fetch(`${API_BASE}/solicitudes/${solicitudId}/cotizar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conductorId, precio }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.error || 'Error al cotizar');
    return json;
  };

  const listarSolicitudesCliente = async (email) => {
    const resp = await fetch(`${API_BASE}/solicitudes/cliente/${encodeURIComponent(email)}`);
    const json = await resp.json();
    setDelCliente(Array.isArray(json) ? json : []);
    return json;
  };

  const actualizarEstadoCliente = async ({ solicitudId, estado }) => {
    const resp = await fetch(`${API_BASE}/solicitudes/${solicitudId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.error || 'Error al actualizar estado');
    return json;
  };

  // Utilidad: iniciar/limpiar polling externo
  const stopPolling = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  };

  return {
    pendientesConductor,
    delCliente,
    crearSolicitudCliente,
    listarPendientesConductor,
    cotizarSolicitud,
    listarSolicitudesCliente,
    actualizarEstadoCliente,
    stopPolling,
  };
}