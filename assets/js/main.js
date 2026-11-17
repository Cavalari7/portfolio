/* Igor Cavalari — Portfólio · interações */
(() => {
  'use strict';

  const doc = document.documentElement;
  doc.classList.add('js');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Ano no rodapé */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Navbar: estado ao rolar + barra de progresso ---------- */
  const nav = $('.nav');
  const progress = $('.scroll-progress span');
  const timeline = $('.timeline');
  const timelineFill = $('.timeline__line');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = doc.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 20);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

    if (timeline && timelineFill) {
      const r = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.7;
      const p = Math.min(Math.max((start - r.top) / r.height, 0), 1);
      timelineFill.style.setProperty('--progress', p.toFixed(3));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Indicador da seção ativa ---------- */
  const navLinks = $$('[data-nav]');
  const mobileLinks = $$('.mobile-menu__links a');
  const indicator = $('.nav__indicator');

  const moveIndicator = (link) => {
    if (!indicator || !link) return;
    const parent = link.parentElement.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    indicator.style.width = `${r.width}px`;
    indicator.style.transform = `translateX(${r.left - parent.left}px)`;
    indicator.style.opacity = '1';
  };

  const setActive = (id) => {
    navLinks.forEach(a => {
      const on = a.dataset.nav === id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); moveIndicator(a); } else a.removeAttribute('aria-current');
    });
    mobileLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => so.observe(s));
  }
  window.addEventListener('resize', () => moveIndicator($('[data-nav].is-active')));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveIndicator($('[data-nav].is-active')));

  /* ---------- Menu mobile ---------- */
  const toggle = $('.nav__toggle');
  const menu = $('#menu-mobile');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (open) setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 300);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener?.('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => ro.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Contadores ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
        const step = (t) => {
          const k = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          el.textContent = String(v).padStart(2, '0');
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  }

  /* ---------- Efeito de digitação ---------- */
  const typed = $('.typed');
  if (typed && !reduceMotion) {
    const words = typed.dataset.words.split('|');
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      if (deleting) {
        i--;
        typed.textContent = word.slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 380); }
        return setTimeout(tick, 38);
      }
      const next = words[w];
      i++;
      typed.textContent = next.slice(0, i);
      if (i === next.length) { deleting = true; return setTimeout(tick, 2200); }
      setTimeout(tick, 70 + Math.random() * 60);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Filtros de projetos ---------- */
  const filters = $$('.filter');
  const projects = $$('.project');
  const empty = $('.projects__empty');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    let shown = 0;
    projects.forEach(p => {
      const match = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('is-hidden', !match);
      p.classList.remove('is-filtering');
      if (match) {
        shown++;
        p.classList.add('is-visible');
        void p.offsetWidth;
        if (!reduceMotion) p.classList.add('is-filtering');
      }
    });
    if (empty) empty.hidden = shown > 0;
  }));

  /* ---------- Recursos exclusivos de mouse (desktop) ---------- */
  if (finePointer && !reduceMotion) {
    /* Inclinação 3D + luz dinâmica nos projetos */
    projects.forEach(card => {
      let raf = 0;
      card.addEventListener('pointermove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          const max = card.classList.contains('project--featured') ? 4 : 7;
          card.style.transition = 'transform .15s ease-out, box-shadow .5s';
          card.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
          card.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
          card.style.setProperty('--mx', `${x * 100}%`);
          card.style.setProperty('--my', `${y * 100}%`);
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.style.transition = '';
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    /* Botões magnéticos */
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Cursor neon */
    const cursor = $('.cursor');
    const dot = $('.cursor__dot'), ring = $('.cursor__ring');
    if (cursor && dot && ring) {
      doc.classList.add('has-cursor');
      let mx = -100, my = -100, rx = -100, ry = -100;
      window.addEventListener('pointermove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        cursor.classList.add('is-visible');
      }, { passive: true });
      document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
      window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
      window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
      document.addEventListener('pointerover', e => {
        cursor.classList.toggle('is-hover', !!e.target.closest('a, button, summary, .project, input, textarea, label'));
      });
      const loop = () => {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  /* ---------- Partículas discretas no hero ---------- */
  const canvas = $('.hero__particles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, pts = [], running = true, mouse = { x: -999, y: -999 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 22000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4, c: Math.random() > 0.5 ? '0,245,212' : '247,37,133'
      }));
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},.7)`; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / 12000) * 0.14})`;
            ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = mdx * mdx + mdy * mdy;
        if (md < 22000) {
          ctx.strokeStyle = `rgba(0,245,212,${(1 - md / 22000) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    if (finePointer) {
      canvas.parentElement.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    }
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting && !document.hidden;
      if (running && !was) draw();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      const was = running; running = !document.hidden;
      if (running && !was) draw();
    });
    draw();
  }

  /* ---------- Formulário de contato (Formspree + fallback por e-mail) ---------- */
  const form = $('#contact-form');
  if (form) {
    const status = $('.form__status', form);
    const btn = $('button[type="submit"]', form);
    const label = $('.btn__label', btn);
    const EMAIL = 'igoremanoelcavalaridasilva@gmail.com';
    const msgs = {
      name: 'Informe seu nome.',
      email: 'Informe um e-mail válido.',
      message: 'Escreva sua mensagem.'
    };
    const validate = (el) => {
      const field = el.closest('.field');
      const err = $('.field__error', field);
      const ok = el.checkValidity() && el.value.trim() !== '';
      field.classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : msgs[el.name];
      return ok;
    };
    $$('input:not(.hp), textarea', form).forEach(el => {
      el.addEventListener('blur', () => { if (el.value) validate(el); });
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-invalid')) validate(el); });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fields = $$('input:not(.hp), textarea', form);
      const valid = fields.map(validate).every(Boolean);
      if (!valid) { fields.find(f => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }

      const data = new FormData(form);
      btn.disabled = true; form.classList.add('is-sending');
      label.textContent = 'Enviando…';
      status.className = 'form__status mono'; status.textContent = '';
      try {
        const r = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error('fail');
        form.reset();
        status.classList.add('is-success');
        status.textContent = '✓ Mensagem enviada! Obrigado pelo contato.';
        label.textContent = 'Mensagem enviada';
        setTimeout(() => { label.textContent = 'Enviar mensagem'; }, 3500);
      } catch (err) {
        status.classList.add('is-error');
        status.textContent = 'Não foi possível enviar agora. Abrindo seu aplicativo de e-mail…';
        label.textContent = 'Enviar mensagem';
        const subject = encodeURIComponent('Contato via portfólio — ' + data.get('name'));
        const body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')');
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      } finally {
        btn.disabled = false; form.classList.remove('is-sending');
      }
    });
  }
})();
