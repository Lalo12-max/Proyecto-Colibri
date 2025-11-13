const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// Auth usuarios
export const authUser = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
};

// Auth conductor
export const authDriver = {
  register: (payload) => request('/conductor/register', { method: 'POST', body: payload }),
  login: (payload) => request('/conductor/login', { method: 'POST', body: payload }),
};

// Viajes
export const viajes = {
  crear: (payload, token) => request('/viajes', { method: 'POST', body: payload, token }),
  disponibles: () => request('/viajes/disponibles'),
  catalogo: (fecha) =>
    request(fecha ? `/viajes/catalogo?fecha=${encodeURIComponent(fecha)}` : '/viajes/catalogo'),
  crearPunto: (payload, token) => request('/puntos', { method: 'POST', body: payload, token }),
  misViajes: (conductorId, estado, token) =>
    request(estado ? `/viajes/conductor/${conductorId}?estado=${encodeURIComponent(estado)}` : `/viajes/conductor/${conductorId}`, { token }),
  zonas: () => request('/puntos/zonas'),
  misPuntos: (conductorId, token) =>
    request(`/puntos/conductor/${conductorId}`, { token }),
};

// Solicitudes
export const solicitudes = {
  crear: (payload, token) => request('/solicitudes', { method: 'POST', body: payload, token }),
  pendientesConductor: (driverId, token) =>
    request(`/solicitudes/conductor/${driverId}`, { token }),
  cotizar: (id, payload, token) =>
    request(`/solicitudes/${id}/cotizar`, { method: 'PATCH', body: payload, token }),
  actualizarEstado: (id, estado, token) =>
    request(`/solicitudes/${id}/estado`, { method: 'PATCH', body: { estado }, token }),
  iniciar: (id, token) =>
    request(`/solicitudes/${id}/iniciar`, { method: 'PATCH', token }),
  finalizar: (id, token) =>
    request(`/solicitudes/${id}/finalizar`, { method: 'PATCH', token }),
  listarCliente: (email, token) =>
    request(`/solicitudes/cliente/${encodeURIComponent(email)}`, { token }),
  delConductor: (driverId, token) =>
    request(`/solicitudes/conductor/${driverId}/mias`, { token }),
  aceptar: (id, conductorId, token) =>
    request(`/solicitudes/${id}/aceptar`, { method: 'PATCH', body: { conductorId }, token }),
  rechazar: (id, token) =>
    request(`/solicitudes/${id}/rechazar`, { method: 'PATCH', token }),
};