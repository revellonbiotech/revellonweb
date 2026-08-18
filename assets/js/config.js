/* ============================================================
   REVELLON — configuración editable
   ------------------------------------------------------------
   Todos los datos de contacto están vacíos a propósito: no se
   inventó ningún email, teléfono ni dirección.

   Completá solamente lo que quieras mostrar. Cada campo vacío
   simplemente no se renderiza en la página.
   ============================================================ */

window.REVELLON_CONFIG = {

  /* --- Datos de contacto (se muestran en la sección Contacto y en el footer) --- */
  email:     'contacto@revellon.ar',
  telefono:  '',   // ej: '+54 9 11 0000 0000'
  whatsapp:  '',   // link completo, ej: 'https://wa.me/5491100000000'
  direccion: '',   // ej: 'Buenos Aires, Argentina'

  /* --- Redes (opcionales) --- */
  instagram: '',   // URL completa
  linkedin:  '',   // URL completa

  /* --- Envío del formulario --------------------------------------------
     Hoy apunta a /api/contacto: la función serverless que vive en
     api/contacto.js y manda el aviso por Resend a contacto@revellon.ar.
     Necesita la variable de entorno RESEND_API_KEY en Vercel.

     Si se deja vacío, el formulario cae al plan B: abre el cliente de
     correo del visitante con el mensaje ya redactado a `email`.
  --------------------------------------------------------------------- */
  formEndpoint: '/api/contacto',

  /* Texto de confirmación tras un envío exitoso */
  formSuccess: '¡Gracias! Recibimos tu mensaje y te vamos a responder a la brevedad.'
};
