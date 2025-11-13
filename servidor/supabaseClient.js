import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  throw new Error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY en .env');
}

export const supabase = createClient(url, anonKey);
export const supabaseAdmin = serviceRoleKey ? createClient(url, serviceRoleKey) : null;

// Diagnóstico rápido de configuración (no imprime claves)
console.log(
  `[Supabase] url=${url} anonKey=${Boolean(anonKey)} serviceRole=${Boolean(serviceRoleKey)} adminClient=${Boolean(
    supabaseAdmin
  )}`
);