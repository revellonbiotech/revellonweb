# Revellón — landing page

Sitio estático, sin dependencias ni build. Se abre haciendo doble clic en `index.html`.

```
index.html
assets/
  css/styles.css
  js/config.js     ← lo único que hace falta editar
  js/main.js
  img/logo.jpeg
```

## Contacto y formulario

El email configurado es **revellonbiotech@gmail.com**. Se muestra en la sección Contacto
y en el pie, y es el destinatario del formulario.

**Cómo envía hoy:** como no hay `formEndpoint`, al enviar se abre el cliente de correo del
visitante con el mensaje ya redactado y dirigido a esa casilla. Funciona bien en celulares
y en equipos con Outlook o Mail configurado, pero **un visitante que usa Gmail desde el
navegador y no tiene un cliente asociado puede no ver que se abra nada**.

**Para que el formulario entregue solo, sin abrir el correo del visitante:** creá un
formulario en Formspree, Basin o Getform (tienen plan gratuito), pegá la URL que te dan
en `formEndpoint` y listo — el código ya hace el POST y muestra el mensaje de éxito.

El resto de los datos se configura en el mismo archivo:

| Campo | Para qué sirve |
|---|---|
| `email` | Se muestra en Contacto y en el footer. Si no hay `formEndpoint`, el formulario abre el cliente de correo con el mensaje ya redactado. |
| `telefono`, `whatsapp`, `direccion` | Datos de contacto opcionales. |
| `instagram`, `linkedin` | Redes opcionales. |
| `formEndpoint` | URL que recibe el POST del formulario (Formspree, Basin, Getform, un endpoint propio…). Tiene prioridad sobre `email`. |

Cada campo que quede vacío simplemente no se muestra. Si no se configura ni `formEndpoint`
ni `email`, el formulario avisa al visitante y deja el detalle técnico en la consola.

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

Al ser estático, sirve cualquier hosting: Netlify, Vercel, Cloudflare Pages o GitHub Pages.
Se sube la carpeta tal cual, sin pasos de build.

Para previsualizar con un servidor local:

```bash
python -m http.server 8777
# http://127.0.0.1:8777
```
