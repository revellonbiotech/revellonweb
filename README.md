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

## La foto de producto — reemplazar

`assets/img/producto.jpg` es **provisoria**. Es una foto de Wikimedia Commons de
Richard Bartz, licencia **CC BY-SA 2.5**, que obliga a mantener el crédito visible
(hoy está debajo de la imagen, en `.photo__credit`).

Cuando tengas una foto propia:

1. Guardala como `assets/img/producto.jpg`, recortada en **4:5** (ej. 1100×1375 px).
2. Borrá el `<span class="photo__credit">` del `index.html`: ya no hace falta atribuir.

Si el archivo no existe, la página muestra un marcador discreto en lugar de una
imagen rota, así que nunca se ve como un error.

## Contenido sensible

La sección de producto **no publica porcentajes de la formulación ni detalles del proceso
productivo**, porque la estrategia de propiedad intelectual está en evaluación. Si más
adelante se decide publicarlos, el lugar es la sección `05 · Primer producto`.

Las propiedades agronómicas se redactaron en potencial ("buscamos", "estamos evaluando",
"en proceso de validación") y sólo se afirman los hechos ya concretados: lote piloto de
250 kg, ensayos en marcha, formulación propia.

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
