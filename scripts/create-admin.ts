import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

// Usamos la service role key para crear usuarios (más poderes)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Uso: npx tsx scripts/create-admin.ts <email> <password>');
    console.log('Ejemplo: npx tsx scripts/create-admin.ts admin@ejemplo.cl MiPassword123');
    process.exit(1);
  }

  console.log(`👤 Creando usuario: ${email}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar email
  });

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Usuario creado exitosamente!');
  console.log('📧 Email:', data.user?.email);
  console.log('🆔 ID:', data.user?.id);
  console.log('\nAhora puedes iniciar sesión en /auth/login');
}

createAdmin();
