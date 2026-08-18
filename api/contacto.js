/* ============================================================
   REVELLON — endpoint del formulario de contacto
   ------------------------------------------------------------
   Función serverless de Vercel. Sin dependencias: habla con la
   API REST de Resend usando el fetch global de Node.

   Variables de entorno (Vercel → Settings → Environment Variables):
     RESEND_API_KEY  (obligatoria)  re_xxxxxxxxxxxx
     MAIL_TO         (opcional)     destino del aviso
     MAIL_FROM       (opcional)     remitente, debe ser del dominio
                                    verificado en Resend
   ============================================================ */
'use strict';

var MAIL_TO   = process.env.MAIL_TO   || 'contacto@revellon.ar';
var MAIL_FROM = process.env.MAIL_FROM || 'Revellon Web <formulario@revellon.ar>';

var LIMITES = { nombre: 120, empresa: 160, email: 160, perfil: 60, mensaje: 4000 };

/* Cortafuegos simple por instancia: no es un rate limit distribuido
   (cada instancia serverless tiene su propia memoria), pero frena la
   ráfaga de un mismo bot mientras la instancia sigue caliente. */
var VENTANA = 60 * 1000;
var MAX_POR_VENTANA = 5;
var visitas = new Map();

function demasiadas(ip) {
  var ahora = Date.now();
  var previas = (visitas.get(ip) || []).filter(function (t) { return ahora - t < VENTANA; });
  previas.push(ahora);
  visitas.set(ip, previas);
  if (visitas.size > 500) visitas.clear();   // techo de memoria
  return previas.length > MAX_POR_VENTANA;
}

function texto(valor, max) {
  return String(valor == null ? '' : valor).trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  var cuerpo = req.body;
  if (typeof cuerpo === 'string') {
    try { cuerpo = JSON.parse(cuerpo); } catch (e) { cuerpo = null; }
  }
  if (!cuerpo || typeof cuerpo !== 'object') {
    return res.status(400).json({ error: 'invalid_body' });
  }

  // Trampa para bots: el campo está oculto, una persona no lo completa.
  if (texto(cuerpo.web, 200)) return res.status(200).json({ ok: true });

  var datos = {
    nombre:  texto(cuerpo.nombre,  LIMITES.nombre),
    empresa: texto(cuerpo.empresa, LIMITES.empresa),
    email:   texto(cuerpo.email,   LIMITES.email),
    perfil:  texto(cuerpo.perfil,  LIMITES.perfil),
    mensaje: texto(cuerpo.mensaje, LIMITES.mensaje)
  };

  if (!datos.nombre) return res.status(400).json({ error: 'nombre_requerido' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    return res.status(400).json({ error: 'email_invalido' });
  }

  var ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (demasiadas(ip)) return res.status(429).json({ error: 'demasiados_envios' });

  if (!process.env.RESEND_API_KEY) {
    console.error('[Revellon] Falta RESEND_API_KEY en las variables de entorno.');
    return res.status(500).json({ error: 'sin_configurar' });
  }

  var lineas = [
    'Nombre: ' + datos.nombre,
    'Empresa / organización: ' + (datos.empresa || '—'),
    'Email: ' + datos.email,
    'Perfil: ' + (datos.perfil || '—'),
    '',
    datos.mensaje || '(sin mensaje)',
    '',
    '— Enviado desde el formulario de revellon.ar'
  ];

  try {
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        reply_to: [datos.email],
        subject: 'Web Revellon — ' + datos.nombre + (datos.perfil ? ' (' + datos.perfil + ')' : ''),
        text: lineas.join('\n')
      })
    });

    if (!r.ok) {
      console.error('[Revellon] Resend respondió ' + r.status + ': ' + (await r.text()));
      return res.status(502).json({ error: 'envio_fallido' });
    }
  } catch (e) {
    console.error('[Revellon] Error llamando a Resend:', e && e.message);
    return res.status(502).json({ error: 'envio_fallido' });
  }

  return res.status(200).json({ ok: true });
};
