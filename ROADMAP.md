# Roadmap — FS Inmobiliaria (demo) & Fersion Tech

> **Documento único de planificación.** Reemplaza a `Roadmap-Producto-FersionTech.md`, `Metodologia-Agil-Fede.md` y `PRODUCT_BACKLOG.md` (absorbidos acá y eliminados). Se actualiza en cada sesión de trabajo: marcar checkboxes, mover estados, agregar/reordenar tareas.
>
> - **Qué ya existe y funciona en detalle** (historias de usuario, criterios de aceptación de lo construido): `HISTORIAS_USUARIOS.md`.
> - **Bitácora técnica histórica** (decisiones, bugs resueltos, cómo retomar una sesión): `PROJECT_PLAN.md`.
> - Este archivo es solo: **qué falta, en qué orden, y cómo vamos trabajando**.

---

## 👉 Próxima tarea al retomar

Sesión del 2026-09-13 (noche): **Fase 1.A (agente conversacional) terminada — RM-01 a RM-09 hechos y probados en vivo.** El agente funciona de punta a punta: calificación → búsqueda real en el catálogo → agendamiento con evento real en Google Calendar → derivación a humano, y se probaron 12 conversaciones distintas incluyendo casos límite (zona sin resultados, fuera de tema, mensajes duplicados, tipo de mensaje no soportado, agendar sin propiedad elegida) sin fallos ni datos inventados. Se usa **Google Gemini** (gratis) en vez de Claude/Anthropic, por decisión explícita de no gastar plata todavía (ver BL-06) — el código quedó desacoplado del proveedor (`src/lib/agent/respond.ts` es la única pieza que habría que tocar para cambiarlo el día de mañana).

1. **Fase 1 (1.A + 1.B) queda completa** — el producto ya está en condiciones de mostrarse/venderse con el número de prueba (alcanza para hacer demos en vivo, incluso que un cliente potencial le escriba él mismo, agregándolo como destinatario de prueba en Meta).
2. **BL-03 (número de WhatsApp Business real) NO es un paso previo a vender** — es un paso del **onboarding de cada cliente que compra** (cada inmobiliaria necesita registrar *su propio* número, no el nuestro). Ya quedó documentado como parte del alta de cliente nuevo en `docs/onboarding-cliente-nuevo.md` (punto 4). Se saca de la lista de bloqueantes de Fase 1.B y se hace cuando aparezca el primer cliente real.
3. **Nota técnica para quien retome**: los nombres/cuotas de modelo de Gemini cambian rápido. Se usa `gemini-3.1-flash-lite` (constante `AGENT_MODEL` en `src/lib/agent/respond.ts`) porque el modelo "grande" recomendado (`gemini-3.6-flash`) tiene solo 20 pedidos/día gratis — se agotó en la misma sesión de pruebas. Si `gemini-3.1-flash-lite` empieza a fallar (404 "no longer available") o da error 429 de cuota, revisar en [console.cloud.google.com](https://console.cloud.google.com) (proyecto de la API key) o probar otro modelo `*-flash-lite` de la lista que devuelve `GET https://generativelanguage.googleapis.com/v1beta/models?key=...`.
4. **Recordatorio importante**: no lanzar ningún cliente real a producción sin antes upgradear Vercel a Pro (ver BL-06) — Hobby prohíbe uso comercial.

**Estado de git**: el trabajo de esta sesión (política de privacidad) ya está pusheado a `origin/main` y en producción. `ROADMAP.md` y `HISTORIAS_USUARIOS.md` están comiteados localmente pero **no pusheados** (a pedido explícito del usuario) — decidir si subirlos antes de seguir.

---

## Cómo trabajamos (metodología ágil simplificada)

Versión de Scrum + Kanban para trabajar solo, con disciplina sin burocracia.

- **Sprints de 1 semana** (lunes a viernes).
- **Tablero de 3 columnas** (acá mismo, con los checkboxes de abajo): Pendiente (⬜) → En progreso (🔄) → Hecho (✅).
- **Regla de oro**: máximo 1-2 tareas en 🔄 al mismo tiempo. No arrancar una tarea nueva sin cerrar o pausar conscientemente la anterior.

**Ritual semanal:**
- **Lunes (planning, 15-20 min)**: elegir 5-8 tareas de este roadmap para la semana, en orden de prioridad (ver abajo).
- **Martes a jueves (ejecución + mini standup de 5 min al empezar)**: ¿qué terminé ayer? ¿qué hago hoy (1-2 tareas)? ¿qué me traba?
- **Viernes (review + retro, 20-30 min)**: pasar lo terminado a ✅. Retro rápida: ¿qué funcionó?, ¿qué trabó?, ¿qué cambio para la semana que viene? Lo no terminado vuelve al tope de la lista, no se descarta ni se acumula sin revisar.

**Orden de prioridad general** (salvo urgencia puntual):
1. Lo que **bloquea** avanzar (ej. una aprobación de Meta que no depende de nosotros — arrancarla cuanto antes aunque no sea "lo más interesante").
2. Lo que tiene **mayor impacto en poder salir a vender**.
3. Lo que se puede hacer **en paralelo** sin frenar lo anterior (legal, redes).

---

## Leyenda

- **Estado**: ⬜ pendiente · 🔄 en progreso · ✅ hecho
- **Prioridad (MoSCoW)**: **Must** (bloquea vender/cobrar) · **Should** (importante, no bloquea) · **Could** (diferencial, sin urgencia) · **Won't** (descartado por ahora)
- **Tamaño**: S (< 1 día) · M (1-3 días) · L (~1 semana) · XL (> 1 semana, candidato a partirse)

---

## Ya construido (Fase 0 — completo ✅)

Sitio completo en español/inglés/ruso, catálogo de propiedades con fotos HDR/tour 360°, formulario de contacto y turnos, panel de administración (CRUD de propiedades con traducción y compresión automática, gestión de leads, agenda con Google Calendar, analítica de vistas), y notificaciones automáticas por WhatsApp (plantillas fijas) al recibir un lead. Detalle completo de cada funcionalidad en `HISTORIAS_USUARIOS.md`.

---

## Fase 1 — Terminar el agente de WhatsApp (Must have — lo que falta antes de vender)

Esta fase tiene **dos partes muy distintas** que conviene no confundir:

### 1.A — El agente conversacional de IA todavía NO está construido ⚠️

> Esto es lo que el roadmap de negocio original llamaba *"la pieza central que falta construir"*. Hoy el sistema **no tiene** un bot que conversa por WhatsApp — solo manda notificaciones de plantilla fija cuando alguien completa un formulario en la web. Definir el prompt, conectar un modelo de IA, y armar el flujo conversacional completo (preguntas → calificación → consulta de propiedades reales → agendamiento) es trabajo nuevo, no un ajuste de lo existente.

- [x] **RM-01 — Definir el prompt base del agente**: tono, qué puede y no puede responder, cómo califica un lead (zona, presupuesto, tipo de propiedad). — ✅ borrador hecho 2026-09-13, ver `docs/agente-whatsapp-prompt.md`. Se ajusta con lo que salga de RM-03/RM-05/RM-09. — *Prioridad: Must · Tamaño: S*
- [x] **RM-02 — Conectar el backend a la API de un modelo de IA** para que el agente responda mensajes entrantes de WhatsApp. — ✅ hecho 2026-09-13. Se evaluó Anthropic pero se decidió arrancar con **Google Gemini** (`gemini-3.6-flash`) por ser gratis (sin tarjeta, mientras no haya presupuesto — ver BL-06) — el código es intercambiable, `src/lib/agent/respond.ts` es la única pieza atada al proveedor. Probado de punta a punta con un mensaje real: el agente respondió con el tono y la lógica de calificación correctos (ver `docs/agente-whatsapp-prompt.md`). — *Must · M*
- [x] **RM-03 — Probar el agente respondiendo preguntas frecuentes genéricas** — ✅ hecho 2026-09-13 junto con RM-02: "Hola, estoy buscando departamentos en venta" → el agente saludó y preguntó la zona, según el orden de calificación definido. — *Must · S*
- [x] **RM-04 — Conectar el agente a las propiedades reales en Supabase** — ✅ hecho 2026-09-13 (`search_properties` tool en `src/lib/agent/tools.ts`, `getPropertiesForTenant` en `src/lib/data/properties.ts`). Probado: consultó el catálogo real y devolvió datos exactos (verificados contra la tabla `properties`). — *Must · M*
- [x] **RM-05 — Probar consultas reales** — ✅ hecho 2026-09-13: "Palermo, y que tenga 2 ambientes" → el agente buscó en el catálogo real, no encontró 2 ambientes pero sí uno de 3 (145 m², USD 450.000, con tour 360°) y lo ofreció como alternativa en vez de inventar un resultado falso — exactamente el comportamiento esperado. — *Must · S*
- [x] **RM-06 — Definir e integrar el agendamiento de visitas** — ✅ hecho 2026-09-13: la conversación de prueba llegó hasta agendar una visita real — el lead quedó con `property_id`/`appointment_date`/`appointment_time` correctos y **se creó el evento real en Google Calendar** (confirmado por el usuario). — *Must · M*
- [x] **RM-07 — Definir las reglas de traspaso a humano** — ✅ hecho 2026-09-13: probado con un pedido de descuento + asesoría impositiva/legal — el agente derivó correctamente en vez de responder, y el humano recibió el aviso por WhatsApp con el motivo específico. — *Must · S*
- [x] **RM-08 — Probar el flujo completo de punta a punta** — ✅ hecho 2026-09-13, en una sola conversación de prueba real: saludo → calificación (zona, ambientes) → búsqueda real en el catálogo → oferta de la propiedad encontrada → agendamiento con fecha/hora → evento en Google Calendar → derivación a humano ante un pedido fuera de alcance. Sin intervención humana en ningún paso salvo la derivación explícita. — *Must · M*
- [x] **RM-09 — Testear con 10-15 conversaciones simuladas distintas** — ✅ hecho 2026-09-13. 12 escenarios probados, todos correctos: zona sin resultados (no inventó nada), alquiler con resultado real, presupuesto muy por debajo del mercado, saludo vago, pedido fuera de tema (chiste — redirigió bien), pedido directo de hablar con un humano, tasación/venta, tipo de propiedad específico (PH), consulta con múltiples criterios a la vez, mensaje duplicado (deduplicación por `wa_message_id` funcionando), mensaje que no es texto (imagen — respuesta genérica sin romper), y pedido de agendar sin especificar propiedad (pidió aclaración en vez de fallar). — *Must · M*
- [x] **RM-10 — Documentar cómo se configura el agente para un cliente nuevo** — ✅ hecho 2026-09-13, ver `docs/onboarding-cliente-nuevo.md`. — *Should · S*

### 1.B — Estabilizar lo transaccional ya construido (notificaciones por WhatsApp)

- [x] **BL-02 — Regenerar el token de acceso de WhatsApp expuesto** — ✅ hecho 2026-09-11. Token viejo revocado, token nuevo funcionando en producción, verificado con un lead real. De paso se detectó y corrigió una exposición adicional de `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, `AGENDA_ICS_TOKEN` y `HEALTHCHECK_SECRET` — los 5 secretos quedaron rotados.
- [x] **BL-01 — Aprobar y activar la plantilla `nuevo_lead_v2` de WhatsApp** — ✅ hecho 2026-09-13. Meta la aprobó (categoría Utilidad, estado "Activa: calidad"). Se actualizó `WHATSAPP_AGENT_TEMPLATE` en `.env.local` y Vercel, se redeployó, y se probaron 3 leads reales seguidos vía el formulario de contacto en local: las 3 notificaciones al agente llegaron sin fallos ni throttling. (Uno de los 3 intentos tuvo un error transitorio de Turbopack/HMR ajeno a WhatsApp — no se repitió al reintentar.)
- [ ] **BL-03 — Registrar un número de WhatsApp Business de producción**, reemplazando el número de prueba. Sin esto, un lead real nunca recibe el WhatsApp de bienvenida (confirmado en vivo el 2026-09-11 y reconfirmado el 2026-09-13 con la plantilla ya aprobada: error 131030, "recipient not in allowed list"). **Re-clasificado el 2026-09-13: no bloquea vender ni demostrar el producto** (el número de prueba alcanza para eso) — es un paso del *onboarding de cada cliente que compra*, con su propio número, no el nuestro. Ver `docs/onboarding-cliente-nuevo.md` punto 4. Se hace recién cuando aparezca el primer cliente real. — *Must (para ese cliente) · M*
- [x] **BL-04 — Pasar el consentimiento OAuth de Google a "En producción"** — ✅ hecho 2026-09-11. Bloqueado en el camino por falta de URL de política de privacidad (ver BL-05, resuelto en la misma sesión). Estado de publicación en Google Cloud Console ahora es "En producción" — el `refresh_token` ya no expira cada 7 días. Google Calendar reconectado desde `/admin/agenda` con el token nuevo (compartido vía Supabase entre local y producción). Al conectar aparece el cartel esperado de "Google no ha verificado esta aplicación" (no bloquea, se acepta con "Ir a FD inmobiliaria admin (no seguro)"), tal como estaba documentado.
- [x] **BL-05 — Política de privacidad básica** — ✅ hecho 2026-09-11. Página `/politica-privacidad` en los 3 idiomas (qué datos se recolectan, para qué, con quién se comparten —Supabase, WhatsApp Business API, Google Calendar—, derechos del usuario). Enlazada desde el footer y desde los formularios de contacto y turnos. Deployada a producción. Fue lo que desbloqueó a BL-04 (Google exige una URL de política de privacidad válida para publicar la app).
- [x] **BL-06 — Revisar el plan de hosting antes de cobrar** — ✅ decidido 2026-09-11. Sigue en Vercel Hobby por ahora (no hay presupuesto para el fijo mensual todavía). **Trigger explícito: upgradear a Pro (US$20/mes) en cuanto el primer cliente firme y pague** — no antes. Hobby prohíbe uso comercial en sus términos, así que no lanzar ningún cliente real a producción sin haber hecho el upgrade primero.
- [x] **BL-07 — QA de punta a punta: crear una propiedad de cero** — ✅ hecho 2026-09-11. Probado con automatización de Chrome: formulario completo, slug autogenerado desde el título, subida de 2 fotos con preview/portada, traducción automática correcta a inglés y ruso (título y descripción), galería funcionando en el sitio público en los 3 idiomas. Sin errores. La propiedad de prueba se borró al terminar (no quedó basura). Nota: el botón de eliminar del panel dispara un `confirm()` nativo del navegador que bloquea la automatización de Chrome — requiere confirmación manual del usuario.
- [x] **BL-08 — Limpieza de datos de prueba** — ✅ hecho 2026-09-11. Se borraron los 24 leads acumulados en sesiones de testing (ninguno era de un cliente real — nombres/emails de prueba o el propio email/teléfono del usuario). Tabla `leads` vacía, lista para datos reales.

---

## Fase 2 — Mejoras técnicas y expansión (Should have)

- [ ] **BL-09 — Versionar el schema de Supabase con migraciones** (Supabase CLI), en vez del script manual `supabase/schema.sql` con `ALTER`s acumulados. — *Should · M*
- [ ] **BL-10 — Canal alternativo de alerta de lead nuevo (email)**, por si `nuevo_lead_v2` no se resuelve favorablemente. — *Should · S · Condicional a BL-01*
- [ ] **BL-11 — Onboarding de un tenant nuevo** (alta de inmobiliaria sin trabajo manual de desarrollo): el modelo de datos ya soporta multi-tenant, falta la UI de alta. Necesario para vender a un segundo cliente, no bloquea al primero. — *Should · L*
- [ ] **BL-12 — Publicación cruzada a Zonaprop / Argenprop** (APIs ya investigadas). Elimina carga duplicada manual, buen argumento de venta. — *Should · L*
- [ ] **BL-13 — Chatbot de calificación de leads** en el sitio web (además del de WhatsApp). — *Should · L*

---

## Fase 3 — AI Virtual Staging (add-on, Could have)

- [ ] Evaluar 2-3 proveedores de API (Roomagen, InstantDeco, Decor8 AI) probando la misma foto en cada uno.
- [ ] Elegir proveedor según relación calidad/precio.
- [ ] Construir el flujo simple: cliente sube foto → API → resultado.
- [ ] Definir precio de venta del add-on (por imagen o paquete), con margen sobre el costo real.
- [ ] Sumar la opción de contratar el add-on en la web/demo.

*(Relacionado: BL-14 — mismo ítem, Could have en la vista de backlog.)*

---

## Fase 4 — Actualizar la demo y la web con el producto final

- [ ] Reflejar en `demo1-fersiontech.vercel.app` el agente de WhatsApp funcionando (o una simulación mostrable), una vez cerrada la Fase 1.
- [ ] Actualizar la sección de planes de `www.fersiontech.com` (Esencial / Profesional + add-on de staging).
- [ ] Evaluar mover la demo a `demo.fersiontech.com` en vez de la URL de Vercel.

---

## Fase 5 — Legal y operativo (en paralelo a lo técnico)

- [ ] Inscripción como monotributista.
- [ ] Definir método de cobro en USD para clientes de EE.UU. (Wise, Payoneer, o similar).
- [ ] Armar PDF one-pager de venta (planes con rangos orientativos, sin precio fijo).
- [ ] Armar guión de pitch para la demo/reunión de venta.
- [ ] Armar tracker de prospectos (Sheets/Notion).
- [ ] Configurar sistema de agendamiento de demos (Calendly o similar).

---

## Fase 6 — Prueba social (en paralelo, no bloqueante)

- [ ] Migrar Instagram de `@fdveloper` a Fersion Tech (handle, bio, foto, destacadas).
- [ ] Publicar 9-12 posts antes de salir a buscar clientes activamente.
- [ ] Conseguir 2-3 clientes piloto (círculo de Sergio) a cambio de testimonio/logo/permiso de uso.

---

## Ideas sin refinar (Could have, más adelante)

- **Búsqueda en lenguaje natural sobre el catálogo** (ej. "depto de 2 ambientes cerca de una plaza en Núñez" resuelto vía LLM). Tamaño L.
- **Tour 360° con datos medibles**: agregar m² y plano navegable, hoy puramente decorativo. Tamaño L.

## Descartado por ahora (Won't have)

- **AVM propio (tasación automática)**: impacto bajo relativo al esfuerzo.
- **Blockchain / tokenización de propiedades**: sin demanda validada en el mercado objetivo.
- **Firma digital propia**: existen soluciones de terceros más maduras y baratas.
- **Planos interactivos**: pospuesto, no entra en el producto por ahora.
- **Plan Elite**: eliminado de la oferta comercial.

---

## Cuándo estamos "listos para ofrecer a clientes"

Mínimo viable: **Fase 1 completa (1.A + 1.B, sin contar BL-03 que es parte del onboarding de cada cliente — ver esa tarea) + Fase 4 hecha + al menos los ítems 1, 3 y 4 de la Fase 5**. Las Fases 3 (staging) y 6 (prueba social) pueden seguir en paralelo incluso después de arrancar el outreach — no son bloqueantes para empezar a contactar prospectos.

**Con RM-01 a RM-10 y BL-01/02/04/05/06/07/08 hechos, la Fase 1 queda completa a estos efectos** — falta la Fase 4 (actualizar demo/web) y los ítems de Fase 5 (legal/operativo) para estar 100% listos para salir a vender.

---

## Historial de cambios

- **2026-09-13 (noche, continuación 3)**: RM-10 hecho (`docs/onboarding-cliente-nuevo.md`). Se re-clasificó BL-03: dejó de tratarse como bloqueante para vender/demostrar el producto — el número de prueba de Meta alcanza para eso — y pasó a ser un paso del onboarding de cada cliente real (cada inmobiliaria registra su propio número). Con esto, la Fase 1 (1.A + 1.B) queda completa a los efectos de "listos para vender" (falta Fase 4 y Fase 5).
- **2026-09-13 (noche, continuación 2)**: RM-09 hecho — 12 conversaciones de prueba distintas (zona sin resultados, alquiler con resultado real, presupuesto muy bajo, saludo vago, pedido fuera de tema, pedido directo de humano, tasación, tipo de propiedad específico, múltiples criterios a la vez, mensaje duplicado, mensaje no-texto, agendar sin propiedad elegida), todas correctas. En el camino se encontró que el modelo `gemini-3.6-flash` tiene solo 20 pedidos/día gratis (se agotó a media prueba, error 429) — se cambió a `gemini-3.1-flash-lite`, que tiene mucho más margen gratis y funciona igual de bien con las herramientas del agente. Con esto, **Fase 1.A queda completa** (RM-01 a RM-09). Se limpiaron los datos de prueba de esta sesión (leads, historial de conversación) — el evento de Google Calendar de prueba anterior lo borró el usuario a mano.
- **2026-09-13 (noche)**: Fase 1.A probada en vivo de punta a punta. Se corrió la migración de Supabase (tabla `whatsapp_messages`, `leads.source` acepta `'whatsapp'`, `leads.email` nullable) directamente desde el SQL Editor. Se decidió no usar Anthropic (sin presupuesto, ver BL-06) y cambiar a Google Gemini (`gemini-3.6-flash`, API gratis sin tarjeta) — se reescribieron `src/lib/agent/respond.ts` y `tools.ts` para el formato de function-calling de Gemini en vez de Anthropic, se sacó la dependencia `@anthropic-ai/sdk` y se agregó `@google/genai`. Una sola conversación de prueba real (mismo teléfono como lead y como agente) validó RM-02 a RM-08 en un solo recorrido: saludo y calificación con tono correcto, búsqueda real en el catálogo (dato verificado contra la tabla `properties`, sin inventar), agendamiento con fecha/hora correctas, evento creado en Google Calendar real, y derivación a un humano ante un pedido de descuento + asesoría impositiva (con el aviso por WhatsApp llegando con el motivo específico). Nota para el futuro: los nombres de modelo de Gemini cambian rápido (`gemini-2.5-flash` ya deprecado para cuentas nuevas al momento de probar) — revisar si `gemini-3.6-flash` sigue vigente si el agente empieza a fallar.
- **2026-09-13 (continuación)**: arrancó Fase 1.A. RM-01 (prompt base del agente, `docs/agente-whatsapp-prompt.md`) y el código de RM-02/RM-04/RM-06/RM-07 quedaron escritos: webhook de Meta (`src/app/api/whatsapp/webhook/route.ts`), conexión a Claude con tool-use (`src/lib/agent/respond.ts`, `tools.ts`), historial de conversación y sync con `/admin/leads` (`src/lib/data/whatsappMessages.ts`, `whatsappLeads.ts`). Se investigaron tutoriales de WhatsApp+Claude y se decidió usar la API de Meta directamente (sin Twilio/n8n), reutilizando la integración existente. El webhook en sí (sin Claude) se probó de punta a punta con éxito. La conexión con Claude queda sin probar por decisión explícita de no cargar crédito en Anthropic todavía. En el camino se encontraron y resolvieron dos issues de testing no relacionados con el código: (1) el número de prueba de WhatsApp estaba cargado en un formato viejo en Meta, causando el error 131030 en formato E.164 — se corrigió re-verificándolo; (2) los mensajes de texto libre solo se pueden mandar dentro de la ventana de 24hs desde el último mensaje del cliente (error 131047) — hay que mandarle un WhatsApp real de prueba al número de test antes de cada tanda de pruebas.
- **2026-09-13**: BL-01 hecha — Meta aprobó `nuevo_lead_v2`. Actualizado el env var en local y Vercel, redeployado, y verificado con 3 leads reales de punta a punta (formulario de contacto en local, vía automatización de Chrome): las 3 notificaciones al agente llegaron sin fallos. El mismo test reconfirmó BL-03 como bloqueante real: el WhatsApp de bienvenida al lead falló las 3 veces con error 131030 (número no está en la lista de destinatarios de prueba de Meta) — limitación de la cuenta de prueba, no un bug de código. Se verificaron también los 3 leads guardados en Supabase sin duplicados (el único intento fallido, por un glitch transitorio de Turbopack, no llegó a insertar nada gracias al orden del código).
- **2026-09-11 (noche, continuación)**: BL-08 hecha — se borraron los 24 leads de prueba acumulados en Supabase (ninguno de un cliente real). BL-06 decidida — se queda en Vercel Hobby (sin presupuesto para el fijo mensual todavía) y se upgradea a Pro recién cuando el primer cliente pague; hasta entonces, ningún cliente real puede pasar a producción. Se chequeó BL-01 en Meta: `nuevo_lead_v2` sigue en revisión, sin novedad. Se borró `tokenwspfersion.txt`, un archivo suelto fuera del repo con un token de WhatsApp en texto plano (resabio de BL-02, ya no necesario).
- **2026-09-11 (noche)**: BL-04 y BL-05 hechas. La política de privacidad (BL-05) se creó específicamente porque bloqueaba a BL-04 (Google no deja publicar la app sin una URL de política de privacidad válida) — dependencia real que no estaba anotada. Con la app en "En producción", el refresh_token de Google Calendar ya no expira cada 7 días.
- **2026-09-11 (tarde)**: BL-07 marcada hecha — QA de crear propiedad de cero probado con automatización de Chrome (ver detalle en la tarea). Sin bugs encontrados.
- **2026-09-11**: consolidación de `Roadmap-Producto-FersionTech.md` + `Metodologia-Agil-Fede.md` + `PRODUCT_BACKLOG.md` en este único archivo (los 3 originales se eliminaron). Se detectó que el agente conversacional de IA por WhatsApp (Fase 1.A) nunca había quedado registrado como pendiente en el backlog técnico — se agrega explícitamente. BL-02 marcada hecha (rotación de token de WhatsApp + rotación de emergencia de 4 secretos adicionales expuestos accidentalmente en sesión de chat). BL-01 pasó a en progreso (plantilla `nuevo_lead_v2` enviada a revisión de Meta).
- **2026-09-10**: creación inicial de `PRODUCT_BACKLOG.md` (ahora absorbido acá), derivado de `PROJECT_PLAN.md` e `HISTORIAS_USUARIOS.md`.
