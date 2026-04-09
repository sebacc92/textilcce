import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { useAdminUserResolver } from '../layout';

export const useUsersLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);

  // Auto-seed admin and diego if they do not exist
  const existingDiego = await db.select().from(users).where(eq(users.username, 'diego')).limit(1);
  if (existingDiego.length === 0) {
     const passDiego = bcrypt.hashSync('DiegoTextil2026!', 10);
     await db.insert(users).values({ id: 'diego-1', username: 'diego', password_hash: passDiego, last_login: new Date() });
  }

  const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
  if (existingAdmin.length === 0) {
     const passAdmin = bcrypt.hashSync('AdminTextil2026!', 10);
     await db.insert(users).values({ id: 'admin-1', username: 'admin', password_hash: passAdmin, last_login: new Date() });
  }

  const allUsers = await db.select().from(users);
  return allUsers;
});

export const useUpdatePasswordAction = routeAction$(
  async (data, { env, fail, cookie }) => {
    try {
      const sessionId = cookie.get('auth_session')?.value;
      if (sessionId !== data.userId) {
         return fail(403, { message: 'Solo puedes cambiar tu propia contraseña.' });
      }
      
      const db = getDb(env);
      const newHash = bcrypt.hashSync(data.newPassword, 10);

      await db.update(users).set({ password_hash: newHash }).where(eq(users.id, data.userId));
      return { success: true, message: 'Contraseña actualizada con éxito.' };
    } catch (e: any) {
      return fail(500, { message: 'Error interno: ' + e.message });
    }
  },
  zod$({
    userId: z.string(),
    newPassword: z.string().min(6, 'Debe tener al menos 6 caracteres'),
  })
);

export const useCreateUserAction = routeAction$(
  async (data, { env, fail }) => {
    try {
      const db = getDb(env);
      
      const existing = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
      if (existing.length > 0) return fail(400, { message: 'El usuario ya existe' });

      const newHash = bcrypt.hashSync(data.password, 10);
      const idStr = 'usr-' + Date.now().toString() + Math.floor(Math.random()*1000);

      await db.insert(users).values({ id: idStr, username: data.username, password_hash: newHash, last_login: new Date() });
      return { success: true, message: 'Usuario creado con éxito.' };
    } catch (e: any) {
      return fail(500, { message: 'Error interno: ' + e.message });
    }
  },
  zod$({
    username: z.string().min(3, 'El nombre de usuario debe tener más de 3 letras').toLowerCase(),
    password: z.string().min(6, 'La contraseña es muy corta'),
  })
);

export default component$(() => {
  const currentUser = useAdminUserResolver();
  const usersList = useUsersLoader();
  const updatePasswordAction = useUpdatePasswordAction();
  const createUserAction = useCreateUserAction();

  const isCreating = useSignal(false);
  const editingUserId = useSignal<string | null>(null);

  const toggleCreate = $(() => {
    isCreating.value = !isCreating.value;
    editingUserId.value = null; // Close any open editors
  });

  const toggleEdit = $((id: string) => {
    editingUserId.value = editingUserId.value === id ? null : id;
    isCreating.value = false;
  });

  return (
    <div class="max-w-4xl mx-auto space-y-6 pb-20">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Cuentas de Acceso</h1>
        <button 
          onClick$={toggleCreate}
          class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {isCreating.value ? 'Cancelar Creación' : '+ Nuevo Administrador'}
        </button>
      </div>

      {createUserAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ {createUserAction.value.message}
        </div>
      )}
      {createUserAction.value?.failed && (
         <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
         ❌ {createUserAction.value.message}
       </div>
      )}
      
      {updatePasswordAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ {updatePasswordAction.value.message}
        </div>
      )}
      {updatePasswordAction.value?.failed && (
         <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
         ❌ {updatePasswordAction.value.message}
       </div>
      )}

      {/* Formulario de Creación */}
      {isCreating.value && (
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 fade-in">
          <h2 class="text-lg font-bold text-slate-800 mb-4">Crear Nuevo Administrador</h2>
          <Form action={createUserAction} class="space-y-4 max-w-sm" onSubmitCompleted$={() => isCreating.value = false}>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
              <input 
                name="username" 
                required 
                class="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña Inicial</label>
              <input 
                name="password" 
                type="password" 
                required 
                minLength={6}
                class="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <button class="bg-slate-900 text-white px-4 py-2 rounded font-medium hover:bg-slate-800 transition">
              {createUserAction.isRunning ? 'Creando...' : 'Crear Usuario'}
            </button>
          </Form>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Último Acceso</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            {usersList.value.map((user) => (
              <>
                <tr key={user.id} class="hover:bg-slate-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {user.username}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {currentUser.value?.id === user.id ? (
                      <button 
                        onClick$={() => toggleEdit(user.id)}
                        class="text-blue-600 hover:text-blue-900"
                      >
                        {editingUserId.value === user.id ? 'Cerrar' : 'Cambiar Contraseña'}
                      </button>
                    ) : (
                      <span class="text-slate-400 text-xs italic" title="No tienes permiso para modificar a otro usuario">Sólo cuenta propia</span>
                    )}
                  </td>
                </tr>
                {/* Formulario Inline Editar Password */}
                {editingUserId.value === user.id && (
                  <tr class="bg-slate-50 border-b border-t border-slate-200">
                    <td colSpan={3} class="px-6 py-4">
                      <Form action={updatePasswordAction} class="flex items-end gap-4 max-w-lg" onSubmitCompleted$={() => editingUserId.value = null}>
                        <input type="hidden" name="userId" value={user.id} />
                        <div class="flex-1">
                          <label class="block text-xs font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                          <input 
                            name="newPassword" 
                            type="password" 
                            required 
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                            class="block w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <button class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition">
                          Guardar
                        </button>
                      </Form>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Gestión de Usuarios | Textil CCE Admin',
};
