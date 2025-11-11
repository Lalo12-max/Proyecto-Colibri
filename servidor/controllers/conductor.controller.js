import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../supabaseClient.js';

export async function registerConductor(req, res) {
  try {
    const { nombreCompleto, telefono, email, fechaNacimiento, password } = req.body;
    if (!nombreCompleto || !telefono || !email || !fechaNacimiento || !password) {
      return res.status(400).json({ error: 'Faltan campos.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // FIX: usar el campo correcto
    });
    if (adminError) {
      return res.status(400).json({ error: adminError.message });
    }
    const userId = adminData.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'No se obtuvo el ID de usuario.' });
    }

    const client = supabaseAdmin ?? supabase;
    const { error: insertError } = await client
      .from('conductores')
      .insert({
        id: userId,
        nombre_completo: nombreCompleto,
        telefono,
        email,
        fecha_nacimiento: fechaNacimiento,
      });

    if (insertError) {
      return res.status(500).json({ error: `Perfil: ${insertError.message}` });
    }

    return res.status(201).json({
      user: { id: userId, email },
      profile: { nombreCompleto, telefono, fechaNacimiento },
    });
  } catch (_e) {
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

export async function loginConductor(req, res) {
  try {
    const { email, password } = req.body;
    console.log('[conductor.login] incoming:', { email, hasPassword: typeof password === 'string' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn('[conductor.login] signIn error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error?.code,
      });
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const userId = data.user?.id;
    const session = data.session ?? null;
    console.log('[conductor.login] signIn success:', {
      userId,
      hasSession: Boolean(session),
      accessTokenLen: session?.access_token ? session.access_token.length : 0,
    });

    const client = supabaseAdmin ?? supabase;
    const { data: row, error: profileError } = await client
      .from('conductores')
      .select('nombre_completo, telefono, fecha_nacimiento, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[conductor.login] profile fetch error:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      return res.status(500).json({ error: profileError.message });
    }

    console.log('[conductor.login] profile found:', {
      id: userId,
      email: row?.email,
      nombre: row?.nombre_completo,
    });

    return res.status(200).json({
      user: { id: userId, email },
      profile: {
        nombreCompleto: row?.nombre_completo,
        telefono: row?.telefono,
        fechaNacimiento: row?.fecha_nacimiento,
      },
      session, // tokens para futuras llamadas autenticadas
    });
  } catch (e) {
    console.error('[conductor.login] exception:', e);
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
}

// Método: registerDriver
export const registerDriver = async (req, res) => {
    const { email, password, nombre, licencia } = req.body;

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre, role: 'driver' },
    });
    if (createErr) {
        console.error('auth.admin.createUser error:', createErr);
        return res.status(400).json({ error: createErr.message });
    }

    const authUserId = created.user?.id;

    const { error: perfilErr } = await supabase
        .from('conductores')
        .insert({ id: authUserId, email, nombre, licencia })
        .select()
        .single();

    if (perfilErr) {
        console.error('insert conductores error:', perfilErr);
        return res.status(500).json({ error: 'No se pudo crear el perfil del conductor' });
    }

    return res.status(201).json({ id: authUserId, email, nombre, licencia });
}