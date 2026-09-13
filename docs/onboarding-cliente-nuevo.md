# Cómo configurar el agente para un cliente nuevo (RM-10)

> El proyecto es single-tenant por deployment hoy (una inmobiliaria = un deploy de Vercel + un proyecto de Supabase), aunque el modelo de datos ya soporta multi-tenant a nivel de tabla (`tenant_id` en todas partes). Este documento cubre el alta manual de un cliente nuevo con la arquitectura actual. Automatizar esto (alta sin trabajo de desarrollo) es BL-11, todavía no hecho.

## 1. Datos a pedirle al cliente antes de arrancar

- Nombre comercial de la inmobiliaria.
- Zonas/barrios que cubre (para el prompt del agente y para cargar el catálogo real).
- Horario de atención humana (mismo que va a figurar en `/contacto` y en el prompt del agente).
- Tono deseado (por defecto: cordial/profesional; algunas inmobiliarias van a querer algo más informal o más corporativo).
- Tipos de operación que maneja (venta, alquiler, o ambas) y tipos de propiedad (departamento, casa, PH, terreno, oficina, local — si maneja otros tipos, hay que sumarlos al `check` de `supabase/schema.sql` y a `SearchPropertiesInput`/`AGENT_TOOLS` en `src/lib/agent/tools.ts`).
- Un número de teléfono para el WhatsApp Business real (no puede tener ya una cuenta de WhatsApp personal o Business App activa).
- Cuenta de Google del/los agente(s) que va(n) a atender turnos (para conectar Google Calendar).

## 2. Infraestructura (una vez por cliente)

1. Proyecto de Supabase nuevo → correr `supabase/schema.sql` completo.
2. Deploy de Vercel nuevo (o el mismo si en el futuro se vuelve multi-tenant real).
3. Cargar el catálogo de propiedades real del cliente (`npm run migrate:properties` está armado para datos de ejemplo — para un cliente real hay que adaptarlo a como el cliente entregue sus datos, o cargar a mano desde `/admin/propiedades`).
4. Variables de entorno (ver README.md secciones 3, 7, 8, 9): Supabase, WhatsApp (Meta Cloud API — **BL-03: usar el número de producción del cliente, no el de prueba**), `GEMINI_API_KEY` (o el proveedor de IA que se use en ese momento), Google Calendar.
5. `TENANT_SLUG` en `.env.local`/Vercel — el slug del cliente nuevo (tiene que matchear el `slug` cargado en la tabla `tenants`).

## 3. Personalizar el agente conversacional

1. Editar `docs/agente-whatsapp-prompt.md`:
   - Reemplazar "FS Inmobiliaria" por el nombre del cliente.
   - Completar la sección "Datos de la inmobiliaria" (zonas, horario, tipos de operación/propiedad).
   - Ajustar el tono en "Rol y tono" si el cliente lo pide.
2. Si el cliente maneja tipos de propiedad u operación que no están en el enum actual, actualizar:
   - `supabase/schema.sql` (constraints de `properties.type`/`properties.operation`).
   - `src/lib/agent/tools.ts` (`SearchPropertiesInput`, `AGENT_TOOLS`).
   - `src/lib/data/properties.ts` (`PropertyFilters`, tipos de `Property` en `src/lib/properties.ts`).
3. No hace falta tocar código para cambiar el contenido del prompt en sí — `getSystemPrompt()` (`src/lib/agent/systemPrompt.ts`) lo lee del `.md` en cada arranque del server.

## 4. WhatsApp Business real (BL-03)

Ver la sección 7 del `README.md` para el paso a paso de Meta for Developers. Puntos clave específicos de un cliente nuevo (no del número de prueba):

1. En el caso de uso de WhatsApp de la app → **Configuración básica → Paso 2: Configuración de producción** → agregar el número de teléfono real del cliente, verificarlo (Meta manda un código por SMS o llamada).
2. **Paso 3: Verificación del negocio** — Meta puede pedir datos legales del negocio (razón social, dirección, a veces documentación). Gratis, pero puede tardar días.
3. Actualizar `WHATSAPP_PHONE_NUMBER_ID` con el ID del número nuevo (ya no el de prueba).
4. Volver a mandar a aprobación las plantillas (`nuevo_lead_v2`, `bienvenida_lead`) si Meta las asocia por número — confirmarlo al hacerlo, puede que solo haga falta re-suscribir el webhook.
5. Sin este paso, el agente **solo puede hablar con los ~5 números de prueba** cargados a mano en el panel de Meta — ver la sección "Probá el agente" en el README para agregar/verificar esos números mientras tanto.

## 5. QA antes de entregarle el agente al cliente

Repetir (aunque sea de forma resumida) las pruebas de RM-03/RM-05/RM-08/RM-09 con el catálogo y el prompt reales del cliente nuevo:
- Preguntas genéricas (tono, tipo de operación/propiedad correctos).
- 2-3 consultas reales contra su catálogo.
- Un flujo completo: consulta → calificación → propiedad real → turno agendado → evento en Google Calendar.
- Al menos un caso de derivación a humano (pedido de descuento, pregunta legal, pedido explícito de hablar con una persona).
