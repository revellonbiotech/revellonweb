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
  email:     'revellonbiotech@gmail.com',
  telefono:  '',   // ej: '+54 9 11 0000 0000'
  whatsapp:  '',   // link completo, ej: 'https://wa.me/5491100000000'
  direccion: '',   // ej: 'Buenos Aires, Argentina'

  /* --- Redes (opcionales) --- */
  instagram: '',   // URL completa
  linkedin:  '',   // URL completa

  /* --- Envío del formulario --------------------------------------------
     Opción A) formEndpoint: URL que reciba un POST con los datos del
               formulario (Formspree, Basin, Getform, un endpoint propio,
               una Google Apps Script Web App, etc.).
     Opción B) dejar formEndpoint vacío y completar `email`: el formulario
               abre el cliente de correo con el mensaje ya redactado.
     Si no se configura ninguna de las dos, el formulario avisa al visitante
     que el canal todavía no está habilitado y no pierde los datos escritos.
  --------------------------------------------------------------------- */
  formEndpoint: '',

  /* Texto de confirmación tras un envío exitoso */
  formSuccess: '¡Gracias! Recibimos tu mensaje y te vamos a responder a la brevedad.'
};
