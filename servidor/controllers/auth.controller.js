import { supabase, supabaseAdmin } from '../supabaseClient.js';

// Método: registerUser
export const registerUser = async (req, res) => {
  try {
    const { email, password, nombre, apellidos, telefono, fechaNacimiento } = req.body;
    console.log('[auth.register] payload:', { email, nombre, apellidos, telefono, fechaNacimiento });

    if (!email || !password || !nombre || !apellidos || !telefono || !fechaNacimiento) {
      return res.status(400).json({ error: 'Faltan campos.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // Crear usuario en Supabase Auth marcando como confirmado
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (adminError) {
      console.error('[auth.register] admin.createUser error:', adminError);
      return res.status(400).json({ error: adminError.message });
    }

    const userId = adminData.user?.id;
    console.log('[auth.register] created userId:', userId);
    if (!userId) {
      return res.status(500).json({ error: 'No se obtuvo el ID de usuario.' });
    }

    // Insertar perfil sin password_hash
    const client = supabaseAdmin ?? supabase;
    const { error: insertError } = await client
      .from('usuarios')
      .insert({
        id: userId,
        email,
        nombre,
        apellidos,
        telefono,
        fecha_nacimiento: fechaNacimiento,
      });

    if (insertError) {
      console.error('[auth.register] insert profile error:', insertError);
      return res.status(500).json({ error: `Perfil: ${insertError.message}` });
    }

    console.log('[auth.register] success for:', email);
    return res.status(201).json({
      user: { id: userId, email },
      profile: { nombre, apellidos, telefono, fechaNacimiento },
    });
  } catch (e) {
    console.error('[auth.register] exception:', e);
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
};

// Método: loginUser
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[auth.login] attempt:', { email });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn('[auth.login] signIn error:', { message: error.message, status: error.status });
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const userId = data.user?.id;
    const session = data.session ?? null;
    console.log('[auth.login] signIn success userId:', userId, 'hasSession:', Boolean(session));

    // Obtener perfil
    const client = supabaseAdmin ?? supabase;
    const { data: profile, error: profileError } = await client
      .from('usuarios')
      .select('nombre, apellidos, telefono, fecha_nacimiento')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[auth.login] profile fetch error:', profileError);
      return res.status(500).json({ error: profileError.message });
    }

    console.log('[auth.login] success for:', email);
    return res.status(200).json({
      user: { id: userId, email },
      profile: {
        nombre: profile?.nombre,
        apellidos: profile?.apellidos,
        telefono: profile?.telefono,
        fechaNacimiento: profile?.fecha_nacimiento,
      },
      session, // incluye access_token, refresh_token
    });
  } catch (e) {
    console.error('[auth.login] exception:', e);
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
};

// Método: confirmEmailDev
export const confirmEmailDev = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'No disponible en producción' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email es requerido' });
    }

    // Buscar usuario por email y confirmar
    const { data: usersList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('[auth.dev.confirm] listUsers error:', listErr);
      return res.status(500).json({ error: 'No se pudo listar usuarios' });
    }

    const user = usersList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data: updated, error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updErr) {
      console.error('[auth.dev.confirm] updateUserById error:', updErr);
      return res.status(500).json({ error: 'No se pudo confirmar el email' });
    }

    return res.status(200).json({ ok: true, userId: updated.user.id });
  } catch (e) {
    console.error('[auth.dev.confirm] exception:', e);
    return res.status(500).json({ error: 'Error interno de servidor.' });
  }
};

