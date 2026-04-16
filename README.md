# Pomer Care

Plataforma de membresía para Madres Pomedarian: landing, autenticación, suscripciones, contenido desbloqueado por progreso, emails automáticos, comunidad privada y panel de administración.

El producto está construido como un programa de 12 meses. La lógica principal no depende de meses de calendario, sino del ciclo individual de cada usuaria: si pausa y después reanuda, continúa desde donde se quedó.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres y Storage
- Stripe Checkout, Customer Portal y webhooks
- Resend para emails transaccionales
- Vercel Analytics y Vercel Cron
- Radix UI, shadcn-style components, Sonner y Lucide

## Funcionalidades

### Web pública

- Landing page en `/`.
- Secciones comerciales: hero, precios, timeline, testimonios, FAQ, CTA final y footer.
- Modal de autenticación con registro e inicio de sesión.
- Botones de suscripción conectados con Stripe Checkout.

### Autenticación y perfiles

- Autenticación con Supabase.
- Creación automática de perfil en `profiles` al registrarse una usuaria.
- Redirección según rol:
  - usuaria normal: `/app`
  - administradora: `/admin`
- Tabla `admin_users` para controlar acceso al panel interno.

### Suscripciones y facturación

- Checkout de Stripe desde `/api/stripe/checkout`.
- Portal de cliente desde `/api/stripe/portal`.
- Webhook de Stripe en `/api/stripe/webhook`.
- Soporte para planes `esencial` y `vip`.
- Cancelación al final del periodo.
- Sincronización de estado de suscripción:
  - `active`
  - `past_due`
  - `canceled`
- Reutilización de cliente Stripe si ya existe por `stripe_customer_id` o email.
- Códigos promocionales habilitados en Checkout.

### Progreso relativo del programa

El programa se calcula por progreso acumulado de cada usuaria, no por fecha fija global.

Campos clave:

- `program_days_consumed`
- `program_last_resumed_at`
- `subscription_start_at`
- `current_period_start`
- `current_period_end`

Reglas principales:

- Día 0: onboarding, email de bienvenida y dossier del mes.
- Día 7: email de seguimiento.
- Día 14: email de seguimiento.
- Día 21: email de seguimiento.
- Día 30: nuevo mes y nuevo dossier.
- Si una usuaria pausa, el progreso queda congelado.
- Si reanuda, continúa desde el mismo punto.
- No se repiten emails ya enviados.
- No se repiten dossiers ya desbloqueados.

### Emails automáticos

- Envío con Resend.
- Cron diario en `/api/cron/process-email-sequence`.
- Configuración de Vercel Cron en `vercel.json`: todos los días a las 09:00 UTC.
- Emails definidos en base de datos mediante `email_sequences`.
- Plantillas visuales en `lib/email/templates`.
- Logs en `email_logs` para trazabilidad y evitar duplicados.
- Soporte para:
  - bienvenida
  - seguimiento
  - desbloqueo de dossier
- Endpoint de prueba de Resend en `/api/test-resend`.

La fuente de verdad editorial está en base de datos, no hardcodeada en las plantillas.

### Dossiers y biblioteca privada

- Catálogo de contenidos en `content_items`.
- Dossiers PDF con `content_type = dossier_pdf`.
- Desbloqueos por usuaria en `unlocks`.
- Dashboard privado en `/app`.
- Sección "Mis dossiers" con contenidos ya desbloqueados.
- Descarga protegida mediante `/api/dossiers/[contentItemId]`.
- Generación de signed URLs de Supabase Storage con expiración corta.
- Bucket esperado: `dossiers`.

### Comunidad privada

- Ruta de comunidad en `/app/comunidad`.
- Acceso solo para usuarias autenticadas con suscripción activa.
- Sala principal sembrada como `comunidad-general`.
- Mensajes en `chat_messages`.
- Salas en `chat_rooms`.
- Moderación por usuaria y sala en `chat_user_moderation`.
- Lectura bloqueada para usuarias bloqueadas.
- Escritura bloqueada para usuarias silenciadas o bloqueadas.
- Preparado para Supabase Realtime sobre `chat_messages`.

### Panel de administración

Ruta principal: `/admin`.

Incluye:

- Dashboard operativo con métricas de emails, dossiers y suscripciones activas.
- Vista de suscripciones activas.
- Navegación lateral admin.
- Guard de acceso mediante `admin_users`.

#### Gestión de emails

Ruta: `/admin/emails`.

- Lista secuencias agrupadas por mes.
- Edita:
  - asunto
  - heading
  - cuerpo
  - CTA label
  - CTA URL
  - estado activo/inactivo
- Guarda cambios con server actions.
- Revalida `/admin` y `/admin/emails`.

#### Gestión de dossiers

Ruta: `/admin/dossiers`.

- Lista dossiers agrupados por mes.
- Edita:
  - título
  - descripción
  - estado activo/inactivo
  - PDF asociado
- Subida de PDFs mediante signed upload URL en `/api/admin/dossiers/upload-url`.
- Validación básica de archivo PDF.
- Guarda `asset_path` en `content_items`.

#### Moderación de chat

Ruta: `/admin/chat`.

- Lista participantes con acceso a comunidad.
- Muestra actividad reciente.
- Permite:
  - silenciar
  - quitar silencio
  - bloquear
  - desbloquear
  - registrar motivo
- Vista del chat como "Mamá de Boo".
- Soporte para borrar mensajes si el componente lo habilita.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Landing pública |
| `/app` | Dashboard privado de usuaria |
| `/app/comunidad` | Comunidad privada |
| `/admin` | Panel admin |
| `/admin/emails` | Gestión de secuencias de emails |
| `/admin/dossiers` | Gestión de dossiers y PDFs |
| `/admin/chat` | Moderación de comunidad |
| `/api/stripe/checkout` | Crea sesión de Checkout |
| `/api/stripe/portal` | Crea sesión del portal de Stripe |
| `/api/stripe/webhook` | Recibe eventos de Stripe |
| `/api/cron/process-email-sequence` | Ejecuta emails y unlocks diarios |
| `/api/dossiers/[contentItemId]` | Acceso protegido a PDF |
| `/api/admin/dossiers/upload-url` | Prepara subida privada de PDF |
| `/api/chat/messages` | Gestión de mensajes de chat |
| `/api/test-resend` | Prueba de envío con Resend |

## Modelo de datos

El esquema actual está documentado en `docs/Database_current.md`.

Tablas principales:

- `profiles`: perfil de usuaria.
- `subscriptions`: estado de suscripción y progreso del programa.
- `content_items`: catálogo global de contenidos.
- `unlocks`: contenidos desbloqueados por usuaria.
- `email_sequences`: secuencias editoriales configurables.
- `email_logs`: registro de envíos.
- `admin_users`: permisos de administración.
- `chat_rooms`: salas de comunidad.
- `chat_messages`: mensajes de comunidad.
- `chat_user_moderation`: silencios y bloqueos.
- `vip_credits`, `tickets`, `audits`, `audit_files`: base modelada para futuras funcionalidades VIP.

## Variables de entorno

Crea un archivo `.env.local` con las variables necesarias:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_ESENCIAL=
STRIPE_PRICE_ID_VIP=

RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=

CRON_SECRET=
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en servidor.
- `NEXT_PUBLIC_*` queda expuesto al cliente.
- `CRON_SECRET` debe enviarse como `Authorization: Bearer <CRON_SECRET>` al ejecutar el cron manualmente.
- Si solo se usa el plan Esencial, `STRIPE_PRICE_ID_VIP` puede quedar sin configurar hasta activar VIP.

## Instalación local

```bash
npm install
npm run dev
```

Abre:

```bash
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Configuración externa necesaria

### Supabase

Necesitas:

- Proyecto Supabase.
- Auth habilitado.
- Tablas y policies del archivo `docs/Database_current.md`.
- Bucket `dossiers`.
- Bucket `audits` si se trabaja la capa VIP.
- Realtime habilitado para `chat_messages` si se quiere chat en tiempo real.
- Usuario admin registrado en `admin_users`.

### Stripe

Necesitas:

- Producto y precio para el plan Esencial.
- Opcionalmente producto y precio para VIP.
- Webhook apuntando a:

```bash
/api/stripe/webhook
```

Eventos usados:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Resend

Necesitas:

- API key.
- Dominio o remitente verificado.
- `EMAIL_FROM` configurado.
- `EMAIL_REPLY_TO` si quieres responder a una dirección concreta.

### Vercel

El cron está definido en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-email-sequence",
      "schedule": "0 9 * * *"
    }
  ]
}
```

En producción, configura también todas las variables de entorno en Vercel.

## Cron manual

Para ejecutar el cron manualmente:

```bash
curl -X POST "http://localhost:3000/api/cron/process-email-sequence" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

También admite parámetros de debug:

```bash
curl -X POST "http://localhost:3000/api/cron/process-email-sequence?now=2026-04-15T09:00:00.000Z&userId=<USER_ID>" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

## Estructura del proyecto

```text
app/
  admin/                  Panel de administración
  api/                    Rutas API
  app/                    Área privada de usuaria
components/
  admin/                  Componentes del panel admin
  app/                    Componentes del dashboard y comunidad
  auth/                   Formularios y modal de autenticación
  landingPage/            Componentes de la landing
docs/
  Database_current.md     Esquema actual de base de datos
  PROJECT_CONTEXT.md      Contexto funcional del producto
  ROADMAP.md              Roadmap del proyecto
lib/
  admin/                  Queries y helpers admin
  billing/                Progreso, acceso y transiciones de suscripción
  chat/                   Lógica de comunidad
  content/                Dossiers y unlocks
  db/                     Acceso a tablas auxiliares
  email/                  Resend, render y plantillas
  supabase/               Clientes Supabase
public/
  images/                 Assets públicos
```

## Reglas de negocio importantes

- Stripe decide el estado de pago y suscripción.
- La app decide el progreso del programa, el contenido desbloqueado y los emails enviados.
- Resend solo entrega emails.
- `email_logs` evita duplicados de emails.
- `unlocks` evita duplicados de dossiers.
- Las plantillas de email no deben contener el contenido editorial principal.
- El contenido editable debe vivir en `email_sequences`.
- Los PDFs no se exponen como assets públicos: se entregan con signed URLs.
- La pausa y reanudacion no deben reiniciar el programa.

## Estado actual

Implementado:

- Landing pública.
- Auth con Supabase.
- Checkout Stripe.
- Portal Stripe.
- Webhook de suscripción.
- Progreso relativo.
- Pausa y reanudacion.
- Emails automáticos.
- Desbloqueo de dossiers.
- Dashboard privado.
- Biblioteca privada.
- Acceso protegido a PDFs.
- Panel admin base.
- Gestión admin de emails.
- Gestión admin de dossiers.
- Subida de PDFs.
- Comunidad privada.
- Moderación de comunidad.

Modelado pero no completamente implementado en producto:

- Créditos VIP.
- Tickets VIP.
- Auditorías mensuales.
- Subida de evidencias para auditorías.

## Roadmap

Consulta `docs/ROADMAP.md` para el plan completo.

Prioridades naturales:

- QA completo del plan Esencial.
- Hardening de Stripe Test Clock.
- Pulido del dashboard privado.
- Observabilidad de cron, emails y webhooks.
- Cierre de la capa VIP.

## Comandos útiles

Build de producción:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Servidor de producción local tras build:

```bash
npm run start
```
