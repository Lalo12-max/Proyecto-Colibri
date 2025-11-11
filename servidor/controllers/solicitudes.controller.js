import { supabase, supabaseAdmin } from '../supabaseClient.js';

export async function crearSolicitud(req, res) {
  try {
    const { clienteId, clienteEmail, origen, destino, pasajeros } = req.body;
    if (!clienteEmail || !origen || !destino || !pasajeros) {
      return res.status(400).json({ error: 'Faltan campos.' });
    }
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes_viaje')
      .insert({
        cliente_id: clienteId ?? null,
        cliente_email: clienteEmail,
        origen,
        destino,
        pasajeros: parseInt(pasajeros, 10),
        status: 'pendiente',
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

export async function listarPendientesConductor(req, res) {
  try {
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes_viaje')
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
      .from('solicitudes_viaje')
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

export async function actualizarEstadoCliente(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!['aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('solicitudes_viaje')
      .update({ status: estado })
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
      .from('solicitudes_viaje')
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
      .from('solicitudes_viaje')
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