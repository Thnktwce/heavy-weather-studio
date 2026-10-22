(() => {
  const buttons = [...document.querySelectorAll('.language-switch button')];
  const contentNodes = [...document.querySelectorAll('[data-i18n]')];
  const projectList = document.querySelector('#project-list');
  const requested = new URLSearchParams(location.search).get('lang');
  let saved;
  try { saved = localStorage.getItem('polyus-language'); } catch (_) { /* Optional storage. */ }
  let language = ['ru', 'en'].includes(requested) ? requested : (['ru', 'en'].includes(saved) ? saved : 'ru');

  const load = async name => {
    const response = await fetch(`./${name}.json?updated=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${name}: ${response.status}`);
    return response.json();
  };
  const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = value;
    return element;
  };
  const safeImage = value => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin || !/\.(?:avif|gif|jpe?g|png|webp)$/i.test(url.pathname)) return null;
      return url.href;
    } catch (_) { return null; }
  };
  const safeLink = value => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch (_) { return null; }
  };
  const videoSource = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      if (url.origin === location.origin && /\.(?:mp4|webm)$/i.test(url.pathname)) {
        return { type: 'file', url: url.href };
      }
      if (url.protocol !== 'https:') return null;
      const host = url.hostname.toLowerCase();
      let id = null;
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
        if (url.pathname === '/watch') id = url.searchParams.get('v');
        else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/)?.[1];
        if (/^[\w-]{11}$/.test(id || '')) return { type: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}` };
      }
      if (host === 'youtu.be' && /^\/[\w-]{11}\/?$/.test(url.pathname)) {
        return { type: 'embed', url: `https://www.youtube-nocookie.com/embed/${url.pathname.split('/')[1]}` };
      }
      if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
        id = url.pathname.match(/^\/(?:video\/)?(\d+)\/?$/)?.[1];
        if (id) return { type: 'embed', url: `https://player.vimeo.com/video/${id}` };
      }
    } catch (_) { /* Ignore unsupported or malformed URLs. */ }
    return null;
  };
  const mediaLabels = () => language === 'ru'
    ? { play: 'Смотреть геймплей', pending: 'Геймплейное видео готовится', stores: 'Играть / страницы игры' }
    : { play: 'Watch gameplay', pending: 'Gameplay video in preparation', stores: 'Play / game pages' };
  function renderVideo(project) {
    const source = videoSource(project.videoUrl);
    const labels = mediaLabels();
    const figure = node('figure', `project-video${source ? '' : ' video-pending'}`);
    if (!source) {
      figure.append(node('span', 'video-pending-mark', '▶'), node('figcaption', '', labels.pending));
      return figure;
    }
    const button = node('button', 'video-trigger');
    button.type = 'button';
    button.setAttribute('aria-label', `${labels.play}: ${project.name}`);
    const poster = safeImage(project.image);
    if (poster) {
      const image = node('img');
      image.src = poster;
      image.alt = '';
      image.loading = 'lazy';
      button.append(image);
    }
    button.append(node('span', 'video-play-icon', '▶'), node('span', 'video-play-label', labels.play));
    button.addEventListener('click', () => {
      if (source.type === 'file') {
        const video = node('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (poster) video.poster = poster;
        video.src = source.url;
        figure.replaceChildren(video);
        video.play().catch(() => { /* Controls stay available if autoplay is blocked. */ });
      } else {
        const frame = node('iframe');
        frame.src = `${source.url}?autoplay=1`;
        frame.title = `${labels.play}: ${project.name}`;
        frame.loading = 'lazy';
        frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        figure.replaceChildren(frame);
      }
    });
    figure.append(button);
    return figure;
  }

  function renderProjects(projects) {
    if (!Array.isArray(projects)) return;
    const fragment = document.createDocumentFragment();
    projects.filter(project => project && project.published !== false && project[language] && project.name).forEach((project, index) => {
      const copy = project[language];
      const article = node('article', `project ${project.featured ? 'featured' : 'secondary'}`);
      if (/^[a-z0-9-]+$/.test(project.slug || '')) article.id = project.slug;
      const headingId = `project-heading-${index}`;
      article.setAttribute('aria-labelledby', headingId);
      const top = node('div', 'project-index');
      top.append(node('span', '', `${String(index + 1).padStart(2, '0')} / ${project.category || 'GAME'}`), node('span', '', copy.status || ''));
      article.append(top);
      const body = node('div', 'project-body');
      const title = node('div', 'project-title');
      title.append(node('p', 'eyebrow', copy.genre || ''));
      const h3 = node('h3', '', project.name);
      h3.id = headingId;
      title.append(h3);
      if (copy.subtitle) title.append(node('p', 'project-subtitle', copy.subtitle));
      body.append(title);
      const detail = node('div', 'project-detail');
      detail.append(node('p', '', copy.description || ''));
      if (Array.isArray(copy.facts) && copy.facts.length) {
        const facts = node('dl', 'facts');
        copy.facts.forEach(fact => {
          const row = node('div');
          row.append(node('dt', '', fact.label || ''), node('dd', '', fact.value || ''));
          facts.append(row);
        });
        detail.append(facts);
      }
      body.append(detail);
      article.append(body);
      article.append(renderVideo(project));
      const imageUrl = safeImage(project.image);
      if (imageUrl) {
        const figure = node('figure', 'project-media');
        const image = node('img');
        image.src = imageUrl;
        image.alt = `${project.name} — ${copy.genre || ''}`;
        image.loading = 'lazy';
        figure.append(image);
        article.append(figure);
      }
      if (Array.isArray(project.stores)) {
        const links = project.stores.map(store => ({
          label: typeof store?.platform === 'string' ? store.platform.trim() : '',
          url: safeLink(store?.url)
        })).filter(store => store.label && store.url);
        if (links.length) {
          const section = node('div', 'project-stores');
          section.append(node('p', 'eyebrow', mediaLabels().stores));
          const list = node('div', 'store-links');
          links.forEach(store => {
            const link = node('a', 'store-link', store.label);
            link.href = store.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.append(node('span', 'store-arrow', '↗'));
            list.append(link);
          });
          section.append(list);
          article.append(section);
        }
      }
      if (Array.isArray(copy.cases) && copy.cases.length) {
        const cases = node('div', 'case-study');
        copy.cases.forEach(item => {
          const section = node('div');
          section.append(node('span', 'case-number', item.label || ''), node('p', '', item.text || ''));
          cases.append(section);
        });
        article.append(cases);
      }
      fragment.append(article);
    });
    projectList.replaceChildren(fragment);
  }

  function applyDesign(design) {
    if (!design || typeof design !== 'object') return;
    const colors = { background: '--ink', panel: '--panel', paper: '--ivory', muted: '--muted', accent: '--red' };
    Object.entries(colors).forEach(([key, property]) => {
      if (typeof design[key] === 'string' && /^#[\da-f]{6}$/i.test(design[key])) {
        document.documentElement.style.setProperty(property, design[key]);
      }
    });
    const heroImage = safeImage(design.heroImage);
    if (heroImage) document.querySelector('.hero').style.setProperty('--hero-image', `url("${heroImage}")`);
    if (typeof design.heroPosition === 'string' && /^(?:left|center|right|\d{1,3}%) (?:top|center|bottom|\d{1,3}%)$/.test(design.heroPosition)) {
      document.querySelector('.hero').style.setProperty('--hero-position', design.heroPosition);
    }
    if (typeof design.heroShade === 'number' && design.heroShade >= 0 && design.heroShade <= 1) {
      document.querySelector('.hero').style.setProperty('--hero-shade', design.heroShade);
    }
    if (['compact', 'standard', 'large'].includes(design.headlineScale)) document.body.dataset.headlineScale = design.headlineScale;
    for (const service of ['github', 'threads']) {
      const link = document.querySelector(`[data-contact="${service}"]`);
      try {
        const url = new URL(design[`${service}Url`]);
        if (url.protocol === 'https:') link.href = url.href;
      } catch (_) { /* Keep the static link. */ }
    }
  }

  Promise.allSettled([load('content'), load('projects'), load('design')]).then(([copyResult, projectsResult, designResult]) => {
    const content = copyResult.status === 'fulfilled' ? copyResult.value : null;
    const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : null;
    if (designResult.status === 'fulfilled') applyDesign(designResult.value);
    function setLanguage(lang, updateUrl = false) {
      if (!content?.[lang]) return;
      language = lang;
      const copy = content[lang];
      contentNodes.forEach(element => {
        if (typeof copy[element.dataset.i18n] === 'string') element.textContent = copy[element.dataset.i18n];
      });
      document.documentElement.lang = lang;
      document.title = copy.title;
      document.querySelector('meta[name="description"]').content = copy.description;
      document.querySelector('meta[property="og:description"]').content = copy.ogDescription;
      document.querySelector('.site-name').setAttribute('aria-label', lang === 'ru' ? 'POLYUS — начало страницы' : 'POLYUS — top of page');
      document.querySelector('.site-header nav').setAttribute('aria-label', lang === 'ru' ? 'Основная навигация' : 'Main navigation');
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
      renderProjects(projects);
      try { localStorage.setItem('polyus-language', lang); } catch (_) { /* Language still works. */ }
      if (updateUrl) {
        const url = new URL(location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
      }
    }
    if (content) {
      buttons.forEach(button => {
        button.disabled = false;
        button.addEventListener('click', () => setLanguage(button.dataset.lang, true));
      });
      setLanguage(language);
    } else {
      console.warn('POLYUS content unavailable; showing Russian HTML fallback.');
      language = 'ru';
      renderProjects(projects);
    }
  });
})();
