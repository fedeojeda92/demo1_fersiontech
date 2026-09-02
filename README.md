# FS Inmobiliaria

Sitio + backend para una inmobiliaria: listado de propiedades, tour virtual 360°, panel de administración, captura de leads y notificaciones por WhatsApp. Next.js 16 (App Router) + Supabase (Postgres + Auth + Storage), pensado para arrancar en $0 (planes free) y escalar cuando entre el primer cliente pagador.

## 1. Requisitos

- Node.js ≥ 20.9
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- (Para WhatsApp) una cuenta de Meta Business Manager y una app en [developers.facebook.com](https://developers.facebook.com/apps) con el producto "WhatsApp"
- (Para Google Calendar) una cuenta gratuita en [Google Cloud Console](https://console.cloud.google.com)

## 2. Setup de Supabase

1. Creá un proyecto nuevo en Supabase (plan **Free**).
2. Andá a **SQL Editor** y corré el contenido de `supabase/schema.sql`. Esto crea las tablas (`tenants`, `agents`, `properties`, `leads`, `property_views`), las políticas RLS, y siembra el tenant `fs-inmobiliaria`.
   - **Si ya habías corrido `schema.sql` antes** (proyecto existente): no lo vuelvas a correr entero (los `create table` fallan si la tabla ya existe). Corré solo el bloque nuevo al final, bajo el comentario "Integracion Google Calendar" — agrega las columnas y el policy de RLS que hacen falta para conectar/desconectar la cuenta.
3. Andá a **Storage** → **New bucket** → nombre `property-images` → marcalo como **Public bucket**. Después corré las dos policies que están comentadas al final de `supabase/schema.sql` (Storage no se crea con `create table`, hay que aplicarlas aparte desde el SQL editor).
4. Andá a **Project Settings → API** y copiá `Project URL`, `anon public key` y `service_role key`.

## 3. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # solo se usa en scripts/migrate-properties.ts, nunca en el cliente
```

Las variables de WhatsApp (`WHATSAPP_*`) y `HEALTHCHECK_SECRET` se pueden dejar vacías al principio — el sitio funciona igual, simplemente no se manda WhatsApp hasta que estén configuradas.

## 4. Instalar y migrar los datos de ejemplo

```bash
npm install
npm run migrate:properties   # sube las 9 propiedades de ejemplo (y sus fotos/tour 360) a Supabase
```

## 5. Crear el primer usuario admin

1. En Supabase → **Authentication → Users → Add user**, creá un usuario con email/contraseña.
2. Esto dispara un trigger que crea automáticamente su fila en `agents` con rol `agent`. Para hacerlo `admin`, corré en el SQL editor:
   ```sql
   update agents set role = 'admin' where id = '<uuid del usuario>';
   ```
3. Entrá a `/admin/login` con ese email/contraseña.

## 6. Correr en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para el sitio público y [http://localhost:3000/admin/login](http://localhost:3000/admin/login) para el panel de administración.

## 7. WhatsApp (Meta Cloud API) — opcional al principio

1. En tu app de Meta for Developers, agregá el producto **WhatsApp** y obtené un número de prueba (gratis).
2. Copiá el `Phone Number ID` y generá un `Access Token` → completá `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`.
3. Diseñá y mandá a aprobación (gratis, 1-2 días hábiles) dos plantillas de mensaje:
   - Una para avisar al agente de un lead nuevo (`WHATSAPP_AGENT_TEMPLATE`, número del agente en `WHATSAPP_AGENT_NUMBER`)
   - Una de bienvenida para el interesado (`WHATSAPP_WELCOME_TEMPLATE`)
4. Mientras las plantillas no estén aprobadas, podés probar mandando mensajes a los 5 números de test gratuitos que permite Meta.

## 8. Google Calendar (OAuth) — turnos con notificación push, opcional al principio

Sin esto configurado, el sitio funciona igual: la agenda del admin sigue con el calendario visual y el feed `.ics` (de solo lectura, con delay de sincronización). Conectando Google Calendar, cada turno agendado crea el evento automáticamente en tu calendario con notificación push al toque.

1. Entrá a [console.cloud.google.com](https://console.cloud.google.com), creá un proyecto nuevo (gratis).
2. **APIs y servicios → Biblioteca** → buscá "Google Calendar API" → **Habilitar** (gratis a esta escala de uso).
3. **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Completá los datos básicos (nombre de la app, email de soporte).
   - En **Usuarios de prueba**, agregá tu propio email de Google (el que uses para el calendario del agente).
   - Dejala en estado **Testing** mientras probás. **Importante**: en estado Testing, el refresh token que te da Google expira solo a los 7 días — para que la sincronización no se corte sola, cuando ya esté probado andá a **Publicar app** y pasala a **En producción** (para este caso de uso — vos conectando tu propia cuenta — no hace falta pasar por la revisión de Google; solo vas a ver un cartel de "app no verificada" al conectar, que podés aceptar con "Ir a [nombre de la app] (no seguro)").
4. **Google Auth Platform → Acceso a los datos → Agregar o quitar permisos** (paso que se pisa fácil — habilitar la API en el paso 2 NO alcanza, el scope hay que agregarlo acá aparte):
   - Filtrá/buscá "calendar" y tildá el permiso `.../auth/calendar.events` ("Google Calendar API").
   - Si no aparece en la lista, pegalo a mano en "Agrega permisos manualmente": `https://www.googleapis.com/auth/calendar.events`.
   - Click **Actualizar**. **Si te salteás este paso, vas a conectar la cuenta sin error pero después vas a ver `403 ACCESS_TOKEN_SCOPE_INSUFFICIENT` en la consola del server al agendar un turno** — y vas a tener que desconectar/reconectar después de arreglarlo (un token ya emitido sin el scope no se puede "completar" después).
5. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**.
   - En **URIs de redirección autorizados**, agregá:
     - `http://localhost:3000/api/auth/google/callback` (para desarrollo local)
     - `https://tu-dominio-de-produccion/api/auth/google/callback` (cuando tengas el deploy)
6. Copiá el `Client ID` y el `Client secret` → completá `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env.local`.
7. Si el proyecto de Supabase ya estaba creado antes de esta funcionalidad, corré en el SQL Editor el bloque "Integracion Google Calendar" del final de `supabase/schema.sql` (ver sección 2).
8. Reiniciá `npm run dev`, entrá a `/admin/agenda` y hacé clic en **Conectar Google Calendar**. En la pantalla de consentimiento de Google confirmá que pide permiso sobre tu calendario (si solo pide "ver tu email", el scope del paso 4 no quedó bien guardado).

## 9. Deploy

Se puede desplegar gratis en el plan **Hobby** de Vercel mientras el producto todavía no factura (revisar los términos de uso no-comercial de ese plan; migrar a Pro apenas haya un cliente pagando). Configurá las mismas variables de entorno del `.env.local` en el proyecto de Vercel.

Para evitar que Supabase Free pause el proyecto por 7 días de inactividad, configurá en GitHub (**Settings → Secrets and variables → Actions**) los secrets `SITE_URL` (la URL del deploy) y `HEALTHCHECK_SECRET` (el mismo valor que en `.env.local`) — el workflow `.github/workflows/supabase-ping.yml` ya hace un ping semanal automático a `/api/health`.
