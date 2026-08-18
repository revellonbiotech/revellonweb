# Revellón — landing page

Sitio estático, sin dependencias ni build. Se abre haciendo doble clic en `index.html`.

```
index.html
api/
  contacto.js      ← funcion serverless del formulario (Vercel)
assets/
  css/styles.css
  js/config.js     ← lo unico que hace falta editar del front
  js/main.js
  img/logo.jpeg
```

## Contacto y formulario

Dominio: **revellon.ar** (Vercel). Casilla publica: **contacto@revellon.ar**, reenviada por
ImprovMX a revellonbiotech@gmail.com.

**Como envia:** el formulario hace POST a `/api/contacto` (misma web, sin CORS). Esa funcion
serverless vive en `api/contacto.js`, valida los datos y manda el aviso con la API REST de
Resend. Sin dependencias npm: usa el `fetch` global de Node.

```
navegador  --POST /api/contacto-->  api/contacto.js  --Resend-->  contacto@revellon.ar
                                                                  |  ImprovMX
                                                                  v
                                                        revellonbiotech@gmail.com
```

El `From` es `formulario@revellon.ar` y el `Reply-To` es el email del visitante: contestas
con Responder y le llega directo. Se usa una direccion distinta de `contacto@` a proposito,
para que el aviso no parezca un mail que la casilla se manda a si misma.

### Variables de entorno (Vercel -> Settings -> Environment Variables)

| Variable | Obligatoria | Valor |
|---|---|---|
| `RESEND_API_KEY` | si | La key de Resend (`re_...`) |
| `MAIL_TO` | no | Destino del aviso. Por defecto `contacto@revellon.ar` |
| `MAIL_FROM` | no | Remitente. Por defecto `Revellon Web <formulario@revellon.ar>`. Tiene que ser del dominio verificado en Resend |

Sin `RESEND_API_KEY` la funcion responde 500 y el visitante ve un aviso con el email para
escribir a mano. Los datos que escribio no se pierden.

### DNS de revellon.ar

El dominio esta delegado a los nameservers de Vercel (`ns1.vercel-dns.com`,
`ns2.vercel-dns.com`), asi que los registros de la web los administra Vercel solo. Los de
correo se agregan a mano desde el panel de DNS del proyecto.

Los registros de Resend van todos en el subdominio `send`, asi que **no tocan los MX raiz
de ImprovMX**: el reenvio de correo entrante y el envio del formulario conviven.

| Para | Tipo | Nombre | Valor | Estado |
|---|---|---|---|---|
| Web | A / ALIAS | `@` y `www` | Los administra Vercel | ok |
| ImprovMX (entrante) | MX | `@` | `mx1.improvmx.com` (10), `mx2.improvmx.com` (20) | ok |
| ImprovMX (entrante) | TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | ok |
| Resend (saliente) | MX | `send` | `feedback-smtp.sa-east-1.amazonses.com` (10) | ok |
| Resend (saliente) | TXT | `send` | `v=spf1 include:amazonses.com ~all` | ok |
| Resend (DKIM) | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3...` | ok |

**Tiene que haber un solo TXT de SPF en la raiz** (el de ImprovMX). El de Amazon SES va en
`send`, no se combinan ni se pone un segundo SPF en `@`.

Verificado el 18/08/2026: los siete registros resuelven bien en Google y en Cloudflare, el
dominio esta validado en Resend y un envio de prueba desde `formulario@revellon.ar`
devolvio HTTP 200. Falta unicamente cargar `RESEND_API_KEY` en Vercel y redeployar.

Para revisar el DNS sin entrar a ningun panel:

```bash
nslookup -type=MX revellon.ar 8.8.8.8            # tienen que ser los de ImprovMX
nslookup -type=TXT send.revellon.ar 8.8.8.8      # SPF de amazonses
nslookup -type=TXT resend._domainkey.revellon.ar 8.8.8.8
nslookup -type=TXT revellon.ar 8.8.8.8            # un solo SPF, el de ImprovMX
```

### Proteccion contra spam

- Campo trampa (honeypot) `web`, oculto fuera de pantalla. Si viene completo la funcion
  responde 200 y no manda nada: el bot cree que funciono.
- Tope de 5 envios por minuto por IP. Es por instancia serverless, no distribuido: frena
  rafagas, no un ataque coordinado. El visitante ve un aviso claro y puede reintentar.
- Limites de largo por campo antes de armar el mail.

### Probar que funciona

```
curl -X POST https://revellon.ar/api/contacto   -H "Content-Type: application/json"   -d '{"nombre":"Prueba","email":"vos@ejemplo.com","mensaje":"test"}'
```

Respuesta esperada: `{"ok":true}`. Si falla, los detalles quedan en Vercel -> Logs (nunca
se le muestran al visitante).

### El resto de config.js

| Campo | Para que sirve |
|---|---|
| `email` | Se muestra en Contacto y en el footer, y es el fallback si `formEndpoint` queda vacio |
| `telefono`, `whatsapp`, `direccion` | Datos de contacto opcionales |
| `instagram`, `linkedin` | Redes opcionales |
| `formEndpoint` | Destino del POST. Tiene prioridad sobre `email` |
| `formSuccess` | Texto de confirmacion tras un envio exitoso |

Cada campo que quede vacio simplemente no se muestra.

## Imagenes

`assets/img/producto.jpg` es la foto del packaging (recorte 4:5 de `ImagenPackaging.jpeg`,
1100x1375, 196 KB). Para cambiarla, guarda la nueva con ese mismo nombre y proporcion.

`assets/img/logo-lockup.png` es el logotipo completo (emblema + EVELLON) con fondo
transparente, recortado y reescalado desde `LogoconLetras.png`. Se usa en nav, hero y pie
con la clase `.logo`; la proporcion es ancho = alto x 3,141, asi que basta con fijar una
sola dimension. Para el pie existe `logo-lockup-light.png`: el verde oscuro del texto y la
macroalga pasa a crudo porque sobre el fondo del pie tenia 1,46:1 de contraste. La lana se
conserva dorada, que ahi contrasta 4,8:1. `assets/img/logo.jpeg` (solo el emblema) queda para el favicon y el og:image.

## Criterio de contenido

La web **no publica porcentajes de la formulación ni detalles del proceso productivo**.
Las cuatro funciones del producto se afirman sin reservas, pero sin cifras agronómicas.

La sección de I+D cita **cuatro estudios internacionales reales y verificados**, cada uno
con enlace al paper. Están encabezados por una aclaración deliberada — *"Los estudios que
siguen no son resultados de Revellon"* — que evita que se lean como validación de esta
formulación en particular. Si se agregan estudios, mantener ese criterio y no citar nada
sin verificar la fuente.

## Diseño

Paleta tomada del logotipo: crudo `#FBF6F0`, lana `#DFCAAB`, oliva `#748245`,
con acentos terracota `#B5613A` y texto `#1C1E18`.

Tipografías: Instrument Sans (títulos), Inter (texto), IBM Plex Mono (etiquetas de dato).
Se cargan desde Google Fonts, con fallback del sistema si no hay conexión.

No se usan fotos de stock: las imágenes son SVG propios (campo de fibras de lana, disco
de suelo con raíces, pellets, diagrama circular), así que la página pesa poco y no depende
de archivos externos.

Todas las animaciones respetan `prefers-reduced-motion`.

## Publicar

Se publica en **Vercel** desde el repo, sin pasos de build. El HTML y los assets se sirven
tal cual y Vercel detecta solo la carpeta `api/` como funcion serverless (Node).

Para previsualizar con un servidor local:

```bash
python -m http.server 8777
# http://127.0.0.1:8777
```

Con `python -m http.server` el formulario no funciona: no hay nadie sirviendo
`/api/contacto`. Para probarlo entero, `npx vercel dev` (levanta estatico + funcion) con un
archivo `.env.local` que tenga `RESEND_API_KEY`. Ese archivo no se commitea.
