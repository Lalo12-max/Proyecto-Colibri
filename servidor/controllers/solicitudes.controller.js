import { supabase, supabaseAdmin } from '../supabaseClient.js';

export async function crearSolicitud(req, res) {
  try {
    const { clienteId, clienteEmail, origen, destino, pasajeros, tipo, puntoId } = req.body;
    if (!clienteEmail || !origen || !destino || !pasajeros) {
      return res.status(400).json({ error: 'Faltan campos.' });
    }
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .insert({
        cliente_id: clienteId ?? null,
        cliente_email: clienteEmail,
        origen,
        destino,
        pasajeros: parseInt(pasajeros, 10),
        status: 'pendiente',
        punto_id: puntoId ?? null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    let cliente_nombre = null;
    if (data?.cliente_id) {
      const { data: u } = await client
        .from('usuarios')
        .select('nombre, apellidos')
        .eq('id', data.cliente_id)
        .single();
      if (u) cliente_nombre = `${u.nombre} ${u.apellidos}`.trim();
    }

    return res.status(201).json({ ...data, cliente_nombre });
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

function calcularPrecio({ origen, destino, pasajeros, tipo }) {
  const base = 50;
  const minimo = 25;
  const porPasajero = 5;
  let precio = base + porPasajero * (parseInt(pasajeros, 10) || 1);
  if (precio < minimo) precio = minimo;
  if (tipo === 'punto') precio = Math.max(minimo, Math.round(precio * 0.2));
  return precio;
}

export async function listarPendientesConductor(req, res) {
  try {
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .select('*')
      .eq('status', 'pendiente')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const enriched = [];
    for (const s of data ?? []) {
      let cliente_nombre = null;
      if (s.cliente_id) {
        const { data: u } = await client
          .from('usuarios')
          .select('nombre, apellidos')
          .eq('id', s.cliente_id)
          .single();
        if (u) cliente_nombre = `${u.nombre} ${u.apellidos}`.trim();
      }
      enriched.push({ ...s, cliente_nombre });
    }

    return res.json(enriched);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function cotizarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { conductorId, precio } = req.body;
    if (!conductorId || !precio) return res.status(400).json({ error: 'Faltan campos.' });
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .update({
        conductor_id: conductorId,
        precio: Number(precio),
        status: 'cotizada',
      })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function aceptarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { conductorId } = req.body;
    if (!conductorId) return res.status(400).json({ error: 'Faltan campos.' });
    const client = supabaseAdmin ?? supabase;

    const { data: s, error: sErr } = await client
      .from('solicitudes')
      .select('*')
      .eq('id', id)
      .single();
    if (sErr || !s) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (s.status !== 'pendiente' && s.status !== 'cotizada') {
      return res.status(400).json({ error: 'Estado no permite aceptación.' });
    }

    const tipoCalc = s.punto_id ? 'punto' : 'solicitud';
    const precio = calcularPrecio({ origen: s.origen, destino: s.destino, pasajeros: s.pasajeros, tipo: tipoCalc });

    const { data, error } = await client
      .from('solicitudes')
      .update({ conductor_id: conductorId, precio, status: 'aceptada' })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    let conductor_nombre = null;
    if (data?.conductor_id) {
      const { data: c } = await client
        .from('conductores')
        .select('nombre_completo')
        .eq('id', data.conductor_id)
        .single();
      if (c) conductor_nombre = c.nombre_completo;
    }

    return res.json({ ...data, conductor_nombre });
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .update({ status: 'rechazada' })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function actualizarEstadoCliente(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const client = supabaseAdmin ?? supabase;

    const estadosStatus = ['pendiente', 'cotizada', 'aceptada', 'rechazada'];
    const estadosHist = ['pendiente', 'cotizada', 'aceptada', 'rechazada', 'cancelada', 'completada'];

    if (!estadosHist.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    const update = estadosStatus.includes(estado)
      ? { status: estado }
      : { estado };

    const { data, error } = await client
      .from('solicitudes')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listarSolicitudesCliente(req, res) {
  try {
    const { email } = req.params;
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .select('*')
      .eq('cliente_email', email)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const enriched = [];
    for (const s of data ?? []) {
      let conductor_nombre = null;
      if (s.conductor_id) {
        const { data: c } = await client
          .from('conductores')
          .select('nombre_completo')
          .eq('id', s.conductor_id)
          .single();
        if (c) conductor_nombre = c.nombre_completo;
      }
      enriched.push({ ...s, conductor_nombre });
    }

    return res.json(enriched);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listarSolicitudesConductorAsignadas(req, res) {
  try {
    const { conductorId } = req.params;
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes')
      .select('*')
      .eq('conductor_id', conductorId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const enriched = [];
    for (const s of data ?? []) {
      let cliente_nombre = null;
      if (s.cliente_id) {
        const { data: u } = await client
          .from('usuarios')
          .select('nombre, apellidos')
          .eq('id', s.cliente_id)
          .single();
        if (u) cliente_nombre = `${u.nombre} ${u.apellidos}`.trim();
      }
      enriched.push({ ...s, cliente_nombre });
    }

    return res.json(enriched);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function iniciarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const client = supabaseAdmin ?? supabase;
    const { data: s, error: sErr } = await client
      .from('solicitudes')
      .select('status')
      .eq('id', id)
      .single();
    if (sErr || !s) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (s.status !== 'aceptada') return res.status(400).json({ error: 'Solo se puede iniciar una solicitud aceptada.' });

    const { data, error } = await client
      .from('solicitudes')
      .update({ status: 'en_progreso' })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function finalizarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const client = supabaseAdmin ?? supabase;
    const { data: s, error: sErr } = await client
      .from('solicitudes')
      .select('status')
      .eq('id', id)
      .single();
    if (sErr || !s) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (s.status !== 'en_progreso') return res.status(400).json({ error: 'Solo se puede finalizar una solicitud en progreso.' });

    const { data, error } = await client
      .from('solicitudes')
      .update({ status: 'completada' })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}