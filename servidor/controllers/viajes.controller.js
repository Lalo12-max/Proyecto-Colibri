import { supabase, supabaseAdmin } from '../supabaseClient.js';

export async function createViaje(req, res) {
  try {
    const { conductorId, origen, destino, fecha, hora, precio, plazas, coche, matricula } = req.body;
    if (!conductorId || !origen || !destino || !fecha || !hora || !precio || !plazas) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const client = supabaseAdmin ?? supabase;

    const { data: conductor, error: conductorError } = await client
      .from('conductores')
      .select('nombre_completo')
      .eq('id', conductorId)
      .single();

    if (conductorError || !conductor) {
      return res.status(400).json({ error: 'Conductor no encontrado.' });
    }

    const { data, error } = await client
      .from('viajes')
      .insert({
        conductor_id: conductorId,
        conductor_nombre: conductor.nombre_completo,
        origen,
        destino,
        fecha,
        hora,
        precio: parseFloat(precio),
        plazas_totales: parseInt(plazas, 10),
        plazas_disponibles: parseInt(plazas, 10),
        coche: coche || 'Coche particular',
        matricula: matricula || 'No especificada',
        estado: 'activo',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listDisponibles(_req, res) {
  try {
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('viajes')
      .select('*')
      .eq('estado', 'activo')
      .gt('plazas_disponibles', 0)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const mapped = (data ?? []).map((v) => ({
      id: v.id,
      from: v.origen,
      to: v.destino,
      date: v.fecha,
      time: v.hora,
      price: v.precio,
      seats: v.plazas_disponibles,
      totalSeats: v.plazas_totales,
      driver: v.conductor_nombre,
      driverId: v.conductor_id,
      car: v.coche,
      licensePlate: v.matricula,
      estado: v.estado,
    }));

    return res.json(mapped);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function createPunto(req, res) {
  try {
    const { conductorId, puntoSalida, plazas, zonaNombre, referenciaTexto, lat, lng, precio_base } = req.body;
    if (!conductorId || !(puntoSalida || zonaNombre) || !plazas) {
      return res.status(400).json({ error: 'Faltan campos: conductorId, punto/zona, plazas.' });
    }

    const client = supabaseAdmin ?? supabase;

    const { data: conductor, error: conductorError } = await client
      .from('conductores')
      .select('nombre_completo')
      .eq('id', conductorId)
      .single();

    if (conductorError || !conductor) {
      return res.status(400).json({ error: 'Conductor no encontrado.' });
    }

    const hoy = new Date();
    const fecha = hoy.toISOString().slice(0, 10);

    const { data: insertado, error } = await client
      .from('viajes')
      .insert({
        conductor_id: conductorId,
        conductor_nombre: conductor.nombre_completo,
        origen: zonaNombre || puntoSalida,
        destino: 'A definir',
        fecha,
        hora: '00:00',
        precio: precio_base ? Number(precio_base) : 0,
        plazas_totales: parseInt(plazas, 10),
        plazas_disponibles: parseInt(plazas, 10),
        coche: 'Coche particular',
        matricula: 'No especificada',
        estado: 'punto',
        zona_nombre: zonaNombre || null,
        referencia_texto: referenciaTexto || null,
        lat: lat ?? null,
        lng: lng ?? null,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ ...insertado, rating: 0 });
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listZonas(_req, res) {
  try {
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from('viajes')
      .select('*')
      .eq('estado', 'punto')
      .order('fecha', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const mapped = (data ?? []).map((v) => ({
      id: v.id,
      zonaNombre: v.zona_nombre || v.origen,
      referenciaTexto: v.referencia_texto || null,
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      plazas: v.plazas_disponibles,
      conductor: v.conductor_nombre,
      precio_punto: v.precio,
    }));
    return res.json(mapped);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listCatalogo(req, res) {
  try {
    const client = supabaseAdmin ?? supabase;
    const { fecha } = req.query;

    let query = client
      .from('viajes')
      .select('*')
      .eq('estado', 'activo')
      .gt('plazas_disponibles', 0);

    if (fecha) {
      query = query.eq('fecha', fecha);
    }

    const { data, error } = await query
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const grouped = {};
    for (const v of data ?? []) {
      const key = v.fecha;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        id: v.id,
        from: v.origen,
        to: v.destino,
        time: v.hora,
        price: v.precio,
        seats: v.plazas_disponibles,
        totalSeats: v.plazas_totales,
        driver: v.conductor_nombre,
        driverId: v.conductor_id,
        car: v.coche,
        licensePlate: v.matricula,
      });
    }

    return res.json({ fechas: Object.keys(grouped), catalogo: grouped });
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function listByConductor(req, res) {
  try {
    const { conductorId } = req.params;
    const { estado } = req.query;
    const client = supabaseAdmin ?? supabase;

    let query = client.from('viajes').select('*').eq('conductor_id', conductorId);
    if (estado) query = query.eq('estado', estado);

    const { data, error } = await query
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const mapped = (data ?? []).map((v) => ({
      id: v.id,
      from: v.origen,
      to: v.destino,
      date: v.fecha,
      time: v.hora,
      price: v.precio,
      seats: v.plazas_disponibles,
      totalSeats: v.plazas_totales,
      driver: v.conductor_nombre,
      driverId: v.conductor_id,
      car: v.coche,
      licensePlate: v.matricula,
      estado: v.estado,
    }));

    return res.json(mapped);
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}