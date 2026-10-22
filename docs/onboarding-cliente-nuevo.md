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

## 4b. Que no le bloqueen el número al cliente (cumplimiento de WhatsApp)

Que a un cliente le suspendan el WhatsApp es lo peor que puede pasar. Antes de entregarle el agente, revisar todo esto. Fuentes, revisadas el 22/10/2026: Términos de servicio de WhatsApp, Política de mensajes de WhatsApp Business (whatsappbusiness.com/policy) y Condiciones de las soluciones de WhatsApp Business (sección de proveedores de IA, vigente desde el 15/01/2026).

- [ ] **Solo la API oficial (Cloud API de Meta).** Nunca herramientas no oficiales que se conectan con un QR (Baileys, whatsapp-web.js, WAHA): son la causa número uno de baneos.
- [ ] **Coexistencia** si el cliente ya usa la app WhatsApp Business: el mismo número queda en la app y en la API, con los chats sincronizados, y no pierde su número ni su historial. Se hace con el Embedded Signup de Meta. El número tiene que tener antigüedad en la app; si es nuevo, calentarlo primero, con pocas conversaciones durante un par de semanas.
- [ ] **El agente solo responde.** El cliente final escribe primero, así que hay consentimiento y estamos dentro de las 24 horas, donde se puede responder libremente y con automatización.
- [ ] **Lo que la inmobiliaria manda por iniciativa propia va con plantillas aprobadas** (recordatorios de visita, seguimientos) y solo a quien aceptó recibirlos. Nada de plantillas de marketing a quien no las pidió.
- [ ] **Siempre una salida a una persona:** configurar `WHATSAPP_AGENT_NUMBER` y la plantilla de derivación (`escalate_to_human`). La política lo exige para la automatización.
- [ ] **Bot del negocio, no de uso general.** La regla de 2026 prohíbe los asistentes de IA de uso general, pero permite los de atención y ventas de un negocio. El prompt ya limita al agente a los temas de la inmobiliaria: no sacar esa regla al personalizarlo.
- [ ] **Verificación de empresa en Meta y perfil completo:** nombre visible aprobado, datos de contacto reales, dirección y web.
- [ ] **Política de privacidad** publicada en la web del cliente. Tiene que mencionar que las consultas las atiende un asistente con IA y qué datos se guardan.
- [ ] **Gemini en un plan pago para clientes reales:** en el plan gratuito Google puede usar las conversaciones para entrenar sus modelos.
- [ ] **Indicador de calidad del número:** revisarlo en el WhatsApp Manager la primera semana y después una vez por semana. Si baja (por bloqueos o denuncias), frenar los envíos de plantillas y revisar qué pasó.

## 5. QA antes de entregarle el agente al cliente

Repetir (aunque sea de forma resumida) las pruebas de RM-03/RM-05/RM-08/RM-09 con el catálogo y el prompt reales del cliente nuevo:
- Preguntas genéricas (tono, tipo de operación/propiedad correctos).
- 2-3 consultas reales contra su catálogo.
- Un flujo completo: consulta → calificación → propiedad real → turno agendado → evento en Google Calendar.
- Al menos un caso de derivación a humano (pedido de descuento, pregunta legal, pedido explícito de hablar con una persona).
