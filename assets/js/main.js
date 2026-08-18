/* ============================================================
   REVELLON — comportamiento de la landing
   Sin dependencias externas.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.REVELLON_CONFIG || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------
     1. Campos de fibra de lana (SVG generativo)
     Curvas suaves que evocan mechas de lana, sin recurrir a
     imágenes pesadas.
  ---------------------------------------------------------- */
  function fiberPath(w, h, i, total) {
    var y = (h / (total + 1)) * (i + 1);
    var amp = 26 + ((i * 37) % 60);          // determinista, sin Math.random
    var phase = (i % 5) * 0.7;
    var seg = w / 4;
    var d = 'M-40 ' + (y + Math.sin(phase) * amp).toFixed(1);
    for (var k = 1; k <= 4; k++) {
      var x  = -40 + seg * k;
      var cx = x - seg / 2;
      var y1 = y + Math.sin(phase + k * 1.1) * amp;
      var y2 = y + Math.sin(phase + k * 1.1 + 0.9) * amp;
      d += ' C ' + (cx - seg / 4).toFixed(1) + ' ' + y1.toFixed(1) +
           ', ' + (cx + seg / 4).toFixed(1) + ' ' + y2.toFixed(1) +
           ', ' + (x + 40).toFixed(1) + ' ' + (y + Math.sin(phase + k * 1.3) * amp).toFixed(1);
    }
    return d;
  }

  function buildFibers(host, w, h) {
    var total = parseInt(host.getAttribute('data-fibers'), 10) || 18;
    var ns = 'http://www.w3.org/2000/svg';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', fiberPath(w, h, i, total));
      p.style.setProperty('--len', String(Math.round(w * 1.5)));
      p.style.setProperty('--d', (i * 0.07).toFixed(2) + 's');
      frag.appendChild(p);
    }
    host.appendChild(frag);
  }

  $$('.fiberfield').forEach(function (svg) {
    var vb = (svg.getAttribute('viewBox') || '0 0 1440 900').split(/\s+/);
    buildFibers(svg, parseFloat(vb[2]), parseFloat(vb[3]));
  });

  /* ----------------------------------------------------------
     2. Nav: estado al hacer scroll, barra de progreso y link activo
  ---------------------------------------------------------- */
  var nav = $('#nav');
  var progress = $('#progress');
  var navLinks = $$('.nav__links a');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('is-stuck', y > 24);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    sweep();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* En una pestaña en segundo plano requestAnimationFrame no corre: si el
     visitante scrollea y cambia de pestaña, `ticking` puede quedar trabado
     en true y el scroll dejaría de procesarse. Al volver, destrabamos. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { ticking = false; onScroll(); }
  });

  var sectionsById = {};
  navLinks.forEach(function (a) {
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) sectionsById[el.id] = a;
  });
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = sectionsById[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(sectionsById).forEach(function (id) {
      navObs.observe(document.getElementById(id));
    });
  }

  /* La animación de fibras del hero no tiene por qué seguir corriendo
     cuando el hero ya no se ve. */
  var hero = $('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { hero.classList.toggle('is-off', !e.isIntersecting); });
    }).observe(hero);
  }

  /* ----------------------------------------------------------
     3. Menú móvil
  ---------------------------------------------------------- */
  var burger = $('#burger');
  var drawer = $('#drawer');
  function closeDrawer() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  }
  burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ----------------------------------------------------------
     4. Activación por scroll (reveals, bloques animados, contadores)

     Se hace con un barrido sobre requestAnimationFrame y no con
     IntersectionObserver: si el visitante llega por un enlace ancla
     o hace un scroll muy rápido, un elemento puede pasar de estar
     debajo del viewport a estar arriba sin haber intersectado nunca.
     IntersectionObserver no dispara en ese caso y el contenido queda
     invisible de forma permanente. El barrido revela todo lo que
     quedó por encima del umbral, se haya visto o no.
  ---------------------------------------------------------- */
  var watched = [];

  function watch(els, ratio, hit) {
    els.forEach(function (el) { watched.push({ el: el, ratio: ratio, hit: hit }); });
  }

  function sweep() {
    if (!watched || !watched.length) return;
    var vh = window.innerHeight;
    var rest = [];
    for (var i = 0; i < watched.length; i++) {
      var w = watched[i];
      if (w.el.getBoundingClientRect().top < vh * w.ratio) w.hit(w.el);
      else rest.push(w);
    }
    watched = rest;
  }

  function revealHit(el) {
    // Escalonado suave entre hermanos que entran a la vez
    var group = el.parentElement ? $$('.reveal', el.parentElement) : [];
    var idx = Math.max(0, group.indexOf(el));
    el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
    el.classList.add('is-in');
  }
  function onHit(el) { el.classList.add('is-on'); }

  /* ----------------------------------------------------------
     5. Contadores numéricos
  ---------------------------------------------------------- */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = prefix + target + suffix; return; }

    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  var counters = $$('[data-count]');
  counters.forEach(function (el) {
    el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
  });

  /* ----------------------------------------------------------
     6. Registro de todo lo que se activa al hacer scroll
     Los hitos de la timeline (.tl) ya llevan la clase .reveal,
     así que el mismo barrido les agrega .is-in y enciende su punto.
  ---------------------------------------------------------- */
  var revealables = $$('.reveal');
  var blocks = $$('[data-anim]');

  if (reduce) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
    blocks.forEach(onHit);
    counters.forEach(runCounter);
  } else {
    watch(revealables, 0.92, revealHit);
    watch(blocks, 0.80, onHit);
    watch(counters, 0.85, runCounter);

    sweep();
    window.addEventListener('resize', sweep, { passive: true });
    window.addEventListener('load', sweep);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sweep);
  }

  /* Al entrar con un #ancla el navegador calcula la posición antes de
     que terminen de cargar las tipografías; el layout se corre después
     y se aterriza en la sección equivocada. Reajustamos al final. */
  function fixHash() {
    if (!location.hash) return;
    var t = document.getElementById(location.hash.slice(1));
    if (t) t.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  window.addEventListener('load', function () { setTimeout(fixHash, 60); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(fixHash, 80); });
  }

  /* ----------------------------------------------------------
     7. Foto de producto
     Mientras no exista assets/img/producto.jpg mostramos un marcador
     en lugar del ícono de imagen rota.
  ---------------------------------------------------------- */
  var foto = $('#foto-producto');
  if (foto) {
    var img = foto.querySelector('img');
    var marcar = function () { foto.classList.add('is-empty'); };
    img.addEventListener('error', marcar);
    if (img.complete && img.naturalWidth === 0) marcar();
  }

  /* ----------------------------------------------------------
     8. Datos de contacto configurables
  ---------------------------------------------------------- */
  function contactItems() {
    var items = [];
    if (CFG.email)     items.push({ label: 'Email',     html: '<a href="mailto:' + CFG.email + '">' + CFG.email + '</a>' });
    if (CFG.telefono)  items.push({ label: 'Teléfono',  html: '<a href="tel:' + CFG.telefono.replace(/\s/g, '') + '">' + CFG.telefono + '</a>' });
    if (CFG.whatsapp)  items.push({ label: 'WhatsApp',  html: '<a href="' + CFG.whatsapp + '" target="_blank" rel="noopener">Escribinos</a>' });
    if (CFG.direccion) items.push({ label: 'Ubicación', html: CFG.direccion });
    if (CFG.instagram) items.push({ label: 'Instagram', html: '<a href="' + CFG.instagram + '" target="_blank" rel="noopener">Instagram</a>' });
    if (CFG.linkedin)  items.push({ label: 'LinkedIn',  html: '<a href="' + CFG.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' });
    return items;
  }

  function fillDetails(el, withLabels) {
    if (!el) return;
    var items = contactItems();
    if (!items.length) return;
    el.innerHTML = items.map(function (i) {
      return '<li>' + (withLabels ? '<span class="mono" style="font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);display:block">' + i.label + '</span>' : '') + i.html + '</li>';
    }).join('');
    el.hidden = false;
  }
  fillDetails($('#contact-details'), true);
  fillDetails($('#footer-details'), false);

  /* ----------------------------------------------------------
     9. Formulario de contacto
  ---------------------------------------------------------- */
  var form = $('#contact-form');
  var status = $('#form-status');

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nombre = $('#f-nombre').value.trim();
    var email  = $('#f-email').value.trim();
    if (!nombre) { setStatus('Contanos tu nombre para poder responderte.', 'error'); $('#f-nombre').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('Revisá el email: parece incompleto.', 'error'); $('#f-email').focus(); return; }

    var data = {
      nombre:  nombre,
      empresa: $('#f-empresa').value.trim(),
      email:   email,
      perfil:  (form.querySelector('input[name="perfil"]:checked') || {}).value || '',
      mensaje: $('#f-mensaje').value.trim(),
      web:     ($('#f-web') || {}).value || ''   // honeypot: vacío en una persona
    };

    var btn = form.querySelector('button[type="submit"]');

    if (CFG.formEndpoint) {
      btn.disabled = true;
      setStatus('Enviando…');
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.status === 429) throw new Error('rate');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        setStatus(CFG.formSuccess, 'ok');
      }).catch(function (err) {
        setStatus(err && err.message === 'rate'
          ? 'Recibimos varios envíos seguidos. Esperá un minuto y probá otra vez.'
          : 'No pudimos enviar el mensaje. Escribinos a ' + (CFG.email || 'nuestro email') + ' y te respondemos.',
          'error');
      }).then(function () {
        btn.disabled = false;
      });
      return;
    }

    if (CFG.email) {
      var cuerpo =
        'Nombre: ' + data.nombre + '\n' +
        'Empresa / organización: ' + data.empresa + '\n' +
        'Email: ' + data.email + '\n' +
        'Perfil: ' + data.perfil + '\n\n' +
        data.mensaje;
      window.location.href = 'mailto:' + CFG.email +
        '?subject=' + encodeURIComponent('Contacto desde la web — ' + data.nombre) +
        '&body=' + encodeURIComponent(cuerpo);
      setStatus('Abrimos tu cliente de correo con el mensaje listo para enviar.', 'ok');
      return;
    }

    // Mensaje para el visitante; el detalle técnico va a la consola.
    setStatus('El formulario todavía no está habilitado. Escribinos por nuestras redes y te respondemos.', 'error');
    console.warn('[Revellon] Formulario sin destino: definí formEndpoint o email en assets/js/config.js');
  });

})();
