# Historias de usuario — FS Inmobiliaria

> Refleja lo que está **implementado y funcionando** hasta la fecha (Fase 1 completa). Ver `PROJECT_PLAN.md` para el detalle técnico y lo pendiente.

Cada historia está escrita para cumplir **INVEST**:
- **I**ndependiente: se puede tomar y entregar sin depender de otra historia de la lista.
- **N**egociable: describe el qué y el para qué, no impone la solución técnica.
- **V**aliosa: entrega un beneficio concreto a un rol.
- **E**stimable: alcance acotado, suficiente para dimensionar el esfuerzo.
- **S**mall (pequeña): cabe en una iteración corta.
- **T**esteable: tiene criterios de aceptación verificables.

Las historias que antes estaban "empaquetadas" (ej. subir + ordenar + eliminar fotos en una sola) se dividieron en historias independientes entre sí.

---

## Visitante del sitio

### Catálogo y detalle de propiedades

**VIS-01 — Listado de propiedades**
Como visitante, quiero ver un listado de las propiedades publicadas, para explorar la oferta disponible.
- El listado muestra foto de portada, título y datos clave (precio, tipo, ubicación) de cada propiedad.
- Solo se listan propiedades publicadas.
- Si no hay propiedades cargadas, se muestra un mensaje en vez de una lista vacía sin explicación.

**VIS-02 — Detalle de una propiedad**
Como visitante, quiero abrir el detalle de una propiedad, para ver toda su información.
- Muestra descripción completa, características y ubicación.
- Se accede con un click desde el listado.

**VIS-03 — Zoom y pantalla completa en la galería de fotos**
Como visitante, quiero hacer zoom y ver en pantalla completa las fotos de una propiedad, para apreciar los detalles.
- Zoom disponible con rueda del mouse, botones +/- y doble click.
- Botón de pantalla completa real, disponible desde la foto principal y desde cualquier foto de la galería.

**VIS-04 — Tour virtual 360°**
Como visitante, quiero recorrer un tour 360° de la propiedad, para conocerla como si la visitara en persona.
- Disponible en las propiedades que tengan panorama cargado.
- Se accede desde un botón/link visible en el detalle de la propiedad.

**VIS-05 — Compartir una propiedad**
Como visitante, quiero compartir el link de una propiedad, para mandárselo a alguien.
- En dispositivos compatibles, usa el share nativo del sistema.
- Si no está disponible, copia el link al portapapeles y muestra confirmación visual.

**VIS-06 — Sitio en varios idiomas**
Como visitante, quiero ver el sitio en español, inglés o ruso, para consumir el contenido en mi idioma.
- Selector de idioma visible en todas las páginas públicas.
- El idioma elegido se mantiene al navegar entre páginas.

**VIS-07 — Página institucional**
Como visitante, quiero ver una página "Nosotros" con información de la inmobiliaria, para conocer quién está detrás del sitio.
- Accesible desde la navegación principal del sitio.

### Contacto y turnos

**VIS-08 — Formulario de contacto**
Como visitante, quiero completar un formulario de contacto, para hacer una consulta general o por una propiedad puntual.
- Campos mínimos: nombre, medio de contacto (teléfono o email) y mensaje.
- Al enviar, el mensaje queda registrado y visible para el agente en el panel de leads.
- Se muestra una confirmación de envío exitoso.

**VIS-09 — Agendar un turno de visita**
Como visitante, quiero agendar un turno para visitar una propiedad eligiendo fecha y hora, para coordinar la visita sin llamar por teléfono.
- El botón de agendar queda deshabilitado hasta elegir fecha Y hora.
- No se puede enviar un turno sin fecha/hora (validado también del lado del servidor).
- El turno queda registrado con la propiedad, fecha y hora correctas.

**VIS-10 — Confirmación de consulta o turno por WhatsApp**
Como visitante, quiero recibir un WhatsApp apenas dejo mi consulta o turno, para tener la certeza de que quedó registrado.
- Se envía un mensaje de WhatsApp al número que dejé en el formulario.
- Si el envío de WhatsApp falla, el contacto o turno se guarda igual (no es bloqueante).

---

## Agente / administrador

### Acceso al panel

**ADM-01 — Iniciar sesión**
Como agente, quiero iniciar sesión con usuario y contraseña, para acceder al panel de administración de forma privada.
- Sin sesión iniciada, cualquier ruta del panel redirige al login.
- Con credenciales inválidas, se muestra un mensaje de error claro.
- Con sesión válida, se accede directo al panel.

**ADM-02 — Acceso directo a /admin sin idioma en la URL**
Como agente, quiero que entrar a `/admin` (sin especificar idioma) me lleve al login o al dashboard según corresponda, para no tener que recordar el prefijo de idioma de memoria.
- Sin sesión, redirige al login con el idioma por defecto.
- Con sesión, redirige directo al dashboard.

### Gestión de propiedades

**ADM-03 — Ver resumen del negocio al entrar**
Como agente, quiero ver un resumen con la cantidad de propiedades y leads al entrar al panel, para tener una vista rápida del estado del negocio.

**ADM-04 — Crear una propiedad**
Como agente, quiero cargar una propiedad nueva con sus datos principales, para publicarla en el sitio.
- Los campos obligatorios se validan antes de guardar.
- La propiedad creada aparece inmediatamente en el listado público.

**ADM-05 — Editar una propiedad**
Como agente, quiero editar los datos de una propiedad existente, para mantener la información actualizada.
- Los cambios guardados se reflejan de inmediato en el sitio público.

**ADM-06 — Elegir la foto de portada**
Como agente, quiero elegir cuál foto de una propiedad es la portada, para controlar qué imagen se ve primero en el listado y el detalle.
- El cambio de portada se ve reflejado en una vista previa sin recargar la página.

**ADM-07 — Reordenar las fotos de una propiedad**
Como agente, quiero reordenar las fotos de una propiedad, para controlar el orden en que se muestran en la galería.
- El nuevo orden se refleja en una vista previa sin recargar la página.

**ADM-08 — Agregar fotos a una propiedad**
Como agente, quiero agregar fotos nuevas a una propiedad existente, para completar o actualizar su galería.
- Las fotos agregadas aparecen en la vista previa sin recargar la página.

**ADM-09 — Eliminar una foto de una propiedad**
Como agente, quiero eliminar una foto individual de una propiedad, para sacar imágenes que ya no sirven.
- Eliminar una foto no afecta a las demás ni a su orden relativo.

**ADM-10 — Compresión automática de fotos**
Como agente, quiero que las fotos que subo se compriman automáticamente, para que la galería cargue rápido sin tener que optimizarlas a mano.
- Toda foto subida por el panel se redimensiona/comprime antes de guardarse.
- Los panoramas del tour 360° quedan excluidos de esta compresión (necesitan su resolución original).

**ADM-11 — Traducción automática de título y descripción**
Como agente, quiero cargar el título y la descripción de una propiedad en un solo idioma y que el sistema traduzca automáticamente a los otros idiomas del sitio, para no tener que escribir todo tres veces.
- Al guardar, los idiomas restantes quedan completos con la traducción automática.
- Si el servicio de traducción falla, el texto original se guarda igual, sin bloquear el guardado de la propiedad.

### Gestión de leads

**ADM-12 — Ver listado de leads**
Como agente, quiero ver un listado de todos los leads (contactos y turnos) con sus datos de contacto, para hacer el seguimiento comercial.
- Cada lead muestra nombre, contacto, propiedad asociada (si aplica) y fecha de creación.

**ADM-13 — Cambiar el estado de un lead**
Como agente, quiero cambiar el estado de un lead (por ejemplo, pendiente o contactado), para organizar mi seguimiento comercial.
- El cambio de estado se guarda y se refleja en el listado.

**ADM-14 — Alerta de lead nuevo por WhatsApp**
Como agente, quiero recibir un WhatsApp cuando entra un lead nuevo, para enterarme al instante sin tener que estar mirando el panel.
- El envío del WhatsApp no bloquea ni demora el registro del lead si falla.

### Agenda de turnos

**ADM-15 — Ver calendario mensual de turnos**
Como agente, quiero ver un calendario mensual con los turnos agendados, para tener una vista rápida de mi semana/mes.

**ADM-16 — Ver los turnos de un día puntual**
Como agente, quiero hacer click en un día del calendario para ver solo los turnos de ese día, en vez de ver siempre una lista larga con todos los turnos.

**ADM-17 — Ver el detalle de un turno**
Como agente, quiero hacer click en un turno para ver su detalle completo (contacto, propiedad, fecha, hora), para tener toda la información antes de la visita.

**ADM-18 — Conectar Google Calendar**
Como agente, quiero conectar mi cuenta de Google Calendar desde el panel, para que los turnos agendados por los visitantes aparezcan automáticamente ahí, con notificación push.
- Un turno nuevo crea un evento en el Google Calendar de cada agente conectado del tenant.
- El proceso de conexión se hace con un botón, sin pasos manuales fuera del panel.

**ADM-19 — Desconectar Google Calendar**
Como agente, quiero poder desconectar mi Google Calendar desde el panel, para dejar de sincronizar turnos si ya no lo necesito.
- Después de desconectar, los turnos nuevos ya no generan eventos en ese calendario.

**ADM-20 — Feed de calendario (.ics) alternativo**
Como agente, quiero un feed de calendario (.ics) para suscribirme desde Apple o Outlook Calendar, para tener mis turnos sincronizados si no uso Google Calendar.

### Analítica

**ADM-21 — Ver vistas por propiedad**
Como agente, quiero ver estadísticas básicas de vistas por propiedad, para saber qué publicaciones generan más interés.

---

## Casos de uso

> Mismo criterio que las historias de usuario: cada caso de uso describe un flujo completo, autocontenido (Independiente) y con condiciones de inicio/fin claras (Testeable), sin acoplarse a otros casos de uso de la lista.
>
> Formato: **Actor**, **Precondición**, **Flujo principal** (pasos numerados), **Flujos alternativos/excepciones**, **Postcondición**.

### Visitante del sitio

**CU-01 — Consultar el catálogo y el detalle de una propiedad**
- **Actor:** Visitante.
- **Precondición:** Ninguna (acceso público).
- **Flujo principal:**
  1. El visitante ingresa a la sección de propiedades.
  2. El sistema muestra el listado de propiedades publicadas.
  3. El visitante selecciona una propiedad del listado.
  4. El sistema muestra el detalle completo de la propiedad seleccionada.
- **Flujos alternativos:**
  - 2a. No hay propiedades publicadas: el sistema muestra un mensaje indicándolo en vez de una lista vacía.
- **Postcondición:** El visitante accedió a la información completa de la propiedad.

**CU-02 — Explorar fotos y tour 360° de una propiedad**
- **Actor:** Visitante.
- **Precondición:** Está viendo el detalle de una propiedad.
- **Flujo principal:**
  1. El visitante hace click en una foto de la galería.
  2. El sistema abre la foto ampliada con controles de zoom (rueda, botones, doble click) y pantalla completa.
  3. El visitante hace click en el tour 360°.
  4. El sistema abre el visor de panorama interactivo.
- **Flujos alternativos:**
  - 3a. La propiedad no tiene tour 360° cargado: la opción no se muestra.
- **Postcondición:** El visitante exploró visualmente la propiedad sin salir del sitio.

**CU-03 — Compartir una propiedad**
- **Actor:** Visitante.
- **Precondición:** Está viendo el detalle de una propiedad.
- **Flujo principal:**
  1. El visitante hace click en el botón de compartir.
  2. El sistema invoca el share nativo del dispositivo.
  3. El visitante elige el medio y comparte el link.
- **Flujos alternativos:**
  - 2a. El dispositivo no soporta share nativo: el sistema copia el link al portapapeles y muestra confirmación visual.
- **Postcondición:** El link de la propiedad queda disponible para compartir.

**CU-04 — Realizar una consulta por el formulario de contacto**
- **Actor:** Visitante.
- **Precondición:** Ninguna.
- **Flujo principal:**
  1. El visitante completa nombre, medio de contacto y mensaje.
  2. El visitante envía el formulario.
  3. El sistema guarda la consulta como lead.
  4. El sistema muestra la confirmación de envío.
  5. El sistema envía un WhatsApp de confirmación al visitante.
- **Flujos alternativos:**
  - 1a. Faltan campos obligatorios: el sistema no permite enviar y señala los campos faltantes.
  - 5a. Falla el envío del WhatsApp: la consulta queda guardada igual, no bloquea el flujo.
- **Postcondición:** La consulta queda registrada y visible para el agente en el panel de leads.

**CU-05 — Agendar un turno de visita**
- **Actor:** Visitante.
- **Precondición:** Ninguna.
- **Flujo principal:**
  1. El visitante completa sus datos de contacto.
  2. El visitante elige fecha y horario.
  3. El sistema habilita el botón de agendar.
  4. El visitante confirma el turno.
  5. El sistema guarda el turno con fecha y hora, asociado a la propiedad.
  6. El sistema envía WhatsApp de confirmación al visitante y de alerta al agente.
- **Flujos alternativos:**
  - 2a. No se eligió fecha u hora: el botón de agendar permanece deshabilitado.
  - 4a. El envío llega sin fecha/hora por otra vía: el servidor rechaza el guardado (validación server-side).
- **Postcondición:** El turno queda registrado, visible en la agenda del agente y sincronizado a Google Calendar si el agente lo tiene conectado.

### Agente / administrador

**CU-06 — Iniciar sesión en el panel de administración**
- **Actor:** Agente.
- **Precondición:** Tiene una cuenta creada en el sistema.
- **Flujo principal:**
  1. El agente ingresa a una ruta del panel.
  2. El sistema, sin sesión activa, redirige al login.
  3. El agente completa usuario y contraseña.
  4. El sistema valida las credenciales y crea la sesión.
  5. El sistema redirige al dashboard.
- **Flujos alternativos:**
  - 4a. Credenciales inválidas: el sistema muestra un error y permite reintentar.
- **Postcondición:** El agente tiene una sesión activa en el panel.

**CU-07 — Publicar una propiedad nueva**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada.
- **Flujo principal:**
  1. El agente abre "Nueva propiedad" y completa los datos en un idioma.
  2. El agente sube una o más fotos.
  3. El agente guarda la propiedad.
  4. El sistema comprime las fotos, traduce título y descripción a los otros idiomas, y publica la propiedad.
- **Flujos alternativos:**
  - 1a. Faltan campos obligatorios: el sistema no permite guardar.
  - 4a. Falla la traducción automática: el sistema guarda igual con el texto original, sin bloquear la publicación.
- **Postcondición:** La propiedad queda visible en el sitio público en los tres idiomas.

**CU-08 — Editar la galería de fotos de una propiedad**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada, propiedad existente.
- **Flujo principal:**
  1. El agente abre la propiedad a editar.
  2. El agente agrega y/o elimina fotos, cambia el orden y/o elige una nueva portada.
  3. El agente guarda los cambios.
  4. El sistema comprime las fotos nuevas y actualiza la galería publicada.
- **Postcondición:** La galería actualizada queda visible en el sitio público, sin recargar la página durante la edición.

**CU-09 — Dar seguimiento a un lead**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada, existe al menos un lead.
- **Flujo principal:**
  1. El agente abre el listado de leads.
  2. El agente selecciona un lead y ve su detalle (contacto, propiedad, fecha).
  3. El agente lo contacta por fuera del sistema.
  4. El agente actualiza el estado del lead (ej. a "contactado").
  5. El sistema guarda el nuevo estado.
- **Postcondición:** El estado del lead queda actualizado y visible en el listado.

**CU-10 — Consultar la agenda de turnos**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada.
- **Flujo principal:**
  1. El agente abre la sección de agenda.
  2. El sistema muestra el calendario mensual con los días que tienen turnos.
  3. El agente hace click en un día con turnos.
  4. El sistema muestra la lista de turnos de ese día.
  5. El agente hace click en un turno.
  6. El sistema muestra el detalle completo del turno en un modal.
- **Postcondición:** El agente conoce el detalle de los turnos agendados sin tener que revisar una lista completa.

**CU-11 — Sincronizar turnos con Google Calendar**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada.
- **Flujo principal:**
  1. El agente abre la agenda y hace click en "Conectar Google Calendar".
  2. El sistema redirige a la pantalla de consentimiento de Google.
  3. El agente autoriza el acceso.
  4. El sistema guarda la conexión y la muestra activa en el panel.
  5. Cada turno nuevo agendado genera un evento con notificación push en el Google Calendar del agente.
- **Flujos alternativos:**
  - 3a. El agente rechaza el consentimiento: la conexión no se establece.
  - 6a. El agente hace click en "Desconectar": el sistema elimina la conexión y deja de sincronizar turnos nuevos.
- **Postcondición:** Los turnos quedan (o dejan de quedar) sincronizados automáticamente con el Google Calendar del agente.

**CU-12 — Consultar analítica de propiedades**
- **Actor:** Agente.
- **Precondición:** Sesión iniciada.
- **Flujo principal:**
  1. El agente abre la sección de analítica.
  2. El sistema muestra la cantidad de vistas por propiedad.
- **Postcondición:** El agente identifica qué propiedades generan más interés.
