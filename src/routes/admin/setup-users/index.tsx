import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import bcrypt from 'bcryptjs';

export const useSetupUsers = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const passDiego = bcrypt.hashSync('diego2024!', 10);
    const passAdmin = bcrypt.hashSync('admin2024!', 10);
    
    await db.insert(users).values([
      { id: 'id-diego', username: 'diego', password_hash: passDiego, last_login: new Date() },
      { id: 'id-admin-2', username: 'admin', password_hash: passAdmin, last_login: new Date() }
    ]).onConflictDoNothing();
    
    return { success: true, message: 'Usuarios creados exitosamente en Turso.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
});

export default component$(() => {
  const status = useSetupUsers();

  return (
    <div class="max-w-2xl mx-auto p-10 space-y-6 text-center">
      <h1 class="text-3xl font-bold text-slate-800">Setup de Usuarios</h1>
      {status.value.success ? (
        <div class="bg-green-100 text-green-800 p-4 rounded-xl border border-green-300">
           <h2 class="font-bold text-lg mb-2">¡Completado!</h2>
           <p>Los usuarios han sido creados.</p>
           <ul class="text-left bg-white p-4 mt-4 rounded border">
             <li><strong>Usuario:</strong> diego <br/><strong>Contraseña:</strong> diego2024!</li>
             <li class="mt-2"><strong>Usuario:</strong> admin <br/><strong>Contraseña:</strong> admin2024!</li>
           </ul>
        </div>
      ) : (
        <div class="bg-red-100 text-red-800 p-4 rounded-xl border border-red-300">
           Error: {status.value.message}
        </div>
      )}
      
      <p class="text-amber-600 font-medium text-sm mt-4">
        ⚠️ ATENCIÓN: Por razones de seguridad, elimina el archivo <code>src/routes/admin/setup-users/index.tsx</code> después de visualizar esto.
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Setup de Usuarios',
};
