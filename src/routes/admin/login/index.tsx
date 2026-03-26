import { component$ } from '@builder.io/qwik';
import { routeAction$, Form, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export const useLoginAction = routeAction$(async (data, { env, cookie, redirect, fail }) => {
  const db = getDb(env);
  
  // Find User
  const userResults = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
  const user = userResults[0];

  if (!user) {
    return fail(400, { message: 'Credenciales inválidas' });
  }

  // Verify Password
  const isValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isValid) {
    return fail(400, { message: 'Credenciales inválidas' });
  }

  // Update last login (optional, running in background without await or just await it)
  await db.update(users).set({ last_login: new Date() }).where(eq(users.id, user.id)).execute().catch(() => {});

  // Set Cookie
  cookie.set('auth_session', user.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.get('NODE_ENV') === 'production',
    maxAge: [1, 'days'],
  });

  throw redirect(302, '/admin/');
}, zod$({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
}));

export default component$(() => {
  const action = useLoginAction();

  return (
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 class="mt-6 text-3xl font-bold tracking-tight text-slate-900">Textil CCE Admin</h2>
        <p class="mt-2 text-sm text-slate-600">Ingresá tus credenciales para continuar</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <Form action={action} class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-700">Usuario</label>
              <div class="mt-1">
                <input id="username" name="username" type="text" required class="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" required class="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm" />
              </div>
            </div>

            {action.value?.failed && (
              <div class="text-sm font-medium text-red-600 bg-red-50 p-3 rounded">{action.value.message}</div>
            )}

            <div>
              <button type="submit" class="flex w-full justify-center rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                Ingresar al Panel
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
});
