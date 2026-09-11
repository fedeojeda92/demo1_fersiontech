# Roadmap — FS Inmobiliaria (demo) & Fersion Tech

> **Documento único de planificación.** Reemplaza a `Roadmap-Producto-FersionTech.md`, `Metodologia-Agil-Fede.md` y `PRODUCT_BACKLOG.md` (absorbidos acá y eliminados). Se actualiza en cada sesión de trabajo: marcar checkboxes, mover estados, agregar/reordenar tareas.
>
> - **Qué ya existe y funciona en detalle** (historias de usuario, criterios de aceptación de lo construido): `HISTORIAS_USUARIOS.md`.
> - **Bitácora técnica histórica** (decisiones, bugs resueltos, cómo retomar una sesión): `PROJECT_PLAN.md`.
> - Este archivo es solo: **qué falta, en qué orden, y cómo vamos trabajando**.

---

## 👉 Próxima tarea al retomar

**BL-01 sigue en revisión en Meta** (no hay nada que hacer ahí hasta que aprueben o rechacen la plantilla `nuevo_lead_v2`) — si vuelvo y ya hay novedad de Meta, atenderla primero. Si no, seguir con lo que quede de la Fase 1.B (BL-03, BL-06, BL-08) o arrancar Fase 1.A (agente de WhatsApp con IA, todavía sin empezar).

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

- [ ] **RM-01 — Definir el prompt base del agente**: tono, qué puede y no puede responder, cómo califica un lead (zona, presupuesto, tipo de propiedad). — *Prioridad: Must · Tamaño: S*
- [ ] **RM-02 — Conectar el backend a la API de un modelo de IA** (Claude/Anthropic u otro) para que el agente responda mensajes entrantes de WhatsApp, no solo mande plantillas salientes. — *Must · M*
- [ ] **RM-03 — Probar el agente respondiendo preguntas frecuentes genéricas** (sin datos de propiedades todavía), para validar el circuito conversacional antes de sumar complejidad. — *Must · S*
- [ ] **RM-04 — Conectar el agente a las propiedades reales en Supabase**, para que responda con datos reales del catálogo y no inventados. — *Must · M*
- [ ] **RM-05 — Probar consultas reales** tipo *"¿tenés departamentos en Palermo de 2 ambientes?"* y validar que la respuesta sea correcta. — *Must · S*
- [ ] **RM-06 — Definir e integrar el agendamiento de visitas** vía el agente conversacional (Google Calendar, ya integrado del lado del panel — falta que el bot lo dispare solo). — *Must · M*
- [ ] **RM-07 — Definir las reglas de traspaso a humano**: qué casos el bot deriva en vez de intentar resolver. — *Must · S*
- [ ] **RM-08 — Probar el flujo completo de punta a punta**: consulta → calificación → oferta de horarios → confirmación de visita, sin intervención humana. — *Must · M*
- [ ] **RM-09 — Testear con 10-15 conversaciones simuladas distintas**, incluyendo casos límite. — *Must · M*
- [ ] **RM-10 — Documentar cómo se configura el agente para un cliente nuevo** (qué datos hay que cargarle: propiedades, zonas, horarios de atención). — *Should · S*

### 1.B — Estabilizar lo transaccional ya construido (notificaciones por WhatsApp)

- [x] **BL-02 — Regenerar el token de acceso de WhatsApp expuesto** — ✅ hecho 2026-09-11. Token viejo revocado, token nuevo funcionando en producción, verificado con un lead real. De paso se detectó y corrigió una exposición adicional de `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, `AGENDA_ICS_TOKEN` y `HEALTHCHECK_SECRET` — los 5 secretos quedaron rotados.
- [ ] **BL-01 — Aprobar y activar la plantilla `nuevo_lead_v2` de WhatsApp** — 🔄 en progreso, enviada a revisión de Meta el 2026-09-11 (categoría Utilidad, reemplaza a `nuevo_lead` que sufre throttling intermitente de Meta, error 131049). Cuando se apruebe: actualizar `WHATSAPP_AGENT_TEMPLATE` en `.env.local` y Vercel, redeployar, probar 3 turnos reales seguidos confirmando que ambos WhatsApp llegan sin fallos. — *Must · S (el trabajo propio; la espera de Meta no depende de nosotros)*
  - Riesgo/plan B: si Meta la rechaza de nuevo como Utilidad, activar **BL-10** (alerta por email como respaldo).
- [ ] **BL-03 — Registrar un número de WhatsApp Business de producción**, reemplazando el número de prueba. Sin esto, un lead real nunca recibe el WhatsApp de bienvenida (confirmado en vivo el 2026-09-11: error 131030, "recipient not in allowed list"). También elimina el quirk de formato de número específico del modo de prueba. — *Must · M · Depende de BL-01 (conviene estabilizar la plantilla antes de exponerla a leads reales)*
- [x] **BL-04 — Pasar el consentimiento OAuth de Google a "En producción"** — ✅ hecho 2026-09-11. Bloqueado en el camino por falta de URL de política de privacidad (ver BL-05, resuelto en la misma sesión). Estado de publicación en Google Cloud Console ahora es "En producción" — el `refresh_token` ya no expira cada 7 días. Google Calendar reconectado desde `/admin/agenda` con el token nuevo (compartido vía Supabase entre local y producción). Al conectar aparece el cartel esperado de "Google no ha verificado esta aplicación" (no bloquea, se acepta con "Ir a FD inmobiliaria admin (no seguro)"), tal como estaba documentado.
- [x] **BL-05 — Política de privacidad básica** — ✅ hecho 2026-09-11. Página `/politica-privacidad` en los 3 idiomas (qué datos se recolectan, para qué, con quién se comparten —Supabase, WhatsApp Business API, Google Calendar—, derechos del usuario). Enlazada desde el footer y desde los formularios de contacto y turnos. Deployada a producción. Fue lo que desbloqueó a BL-04 (Google exige una URL de política de privacidad válida para publicar la app).
- [ ] **BL-06 — Revisar el plan de hosting antes de cobrar**: hoy corre en Vercel Hobby (prohíbe uso comercial) — evaluar y migrar a Pro si corresponde. — *Must · S (decisión simple, implica pasar de costo $0 a un fijo mensual)*
- [x] **BL-07 — QA de punta a punta: crear una propiedad de cero** — ✅ hecho 2026-09-11. Probado con automatización de Chrome: formulario completo, slug autogenerado desde el título, subida de 2 fotos con preview/portada, traducción automática correcta a inglés y ruso (título y descripción), galería funcionando en el sitio público en los 3 idiomas. Sin errores. La propiedad de prueba se borró al terminar (no quedó basura). Nota: el botón de eliminar del panel dispara un `confirm()` nativo del navegador que bloquea la automatización de Chrome — requiere confirmación manual del usuario.
- [ ] **BL-08 — Limpieza de datos de prueba**: borrar leads de prueba acumulados en sesiones de testing (incluye varios generados en la sesión del 2026-09-11). — *Must · S*

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

Mínimo viable: **Fase 1 completa (1.A + 1.B) + Fase 4 hecha + al menos los ítems 1, 3 y 4 de la Fase 5**. Las Fases 3 (staging) y 6 (prueba social) pueden seguir en paralelo incluso después de arrancar el outreach — no son bloqueantes para empezar a contactar prospectos.

---

## Historial de cambios

- **2026-09-11 (noche)**: BL-04 y BL-05 hechas. La política de privacidad (BL-05) se creó específicamente porque bloqueaba a BL-04 (Google no deja publicar la app sin una URL de política de privacidad válida) — dependencia real que no estaba anotada. Con la app en "En producción", el refresh_token de Google Calendar ya no expira cada 7 días.
- **2026-09-11 (tarde)**: BL-07 marcada hecha — QA de crear propiedad de cero probado con automatización de Chrome (ver detalle en la tarea). Sin bugs encontrados.
- **2026-09-11**: consolidación de `Roadmap-Producto-FersionTech.md` + `Metodologia-Agil-Fede.md` + `PRODUCT_BACKLOG.md` en este único archivo (los 3 originales se eliminaron). Se detectó que el agente conversacional de IA por WhatsApp (Fase 1.A) nunca había quedado registrado como pendiente en el backlog técnico — se agrega explícitamente. BL-02 marcada hecha (rotación de token de WhatsApp + rotación de emergencia de 4 secretos adicionales expuestos accidentalmente en sesión de chat). BL-01 pasó a en progreso (plantilla `nuevo_lead_v2` enviada a revisión de Meta).
- **2026-09-10**: creación inicial de `PRODUCT_BACKLOG.md` (ahora absorbido acá), derivado de `PROJECT_PLAN.md` e `HISTORIAS_USUARIOS.md`.
