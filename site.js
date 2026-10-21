(() => {
  const buttons = [...document.querySelectorAll('.language-switch button')];
  const contentNodes = [...document.querySelectorAll('[data-i18n]')];
  const query = new URLSearchParams(location.search).get('lang');
  let saved;
  try { saved = localStorage.getItem('polyus-language'); } catch (_) { /* Storage may be unavailable. */ }

  fetch('./content.json?v=polyus-2')
    .then(response => {
      if (!response.ok) throw new Error(`Content ${response.status}`);
      return response.json();
    })
    .then(content => {
      function setLanguage(lang, updateUrl = false) {
        if (!content[lang]) return;
        const copy = content[lang];
        contentNodes.forEach(node => {
          const value = copy[node.dataset.i18n];
          if (typeof value === 'string') node.textContent = value;
        });
        document.documentElement.lang = lang;
        document.title = copy.title;
        document.querySelector('meta[name="description"]').content = copy.description;
        document.querySelector('meta[property="og:description"]').content = copy.ogDescription;
        document.querySelector('.site-name').setAttribute('aria-label', lang === 'ru' ? 'POLYUS — начало страницы' : 'POLYUS — top of page');
        document.querySelector('.site-header nav').setAttribute('aria-label', lang === 'ru' ? 'Основная навигация' : 'Main navigation');
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
        try { localStorage.setItem('polyus-language', lang); } catch (_) { /* Language still works in this tab. */ }
        if (updateUrl) {
          const url = new URL(location.href);
          url.searchParams.set('lang', lang);
          history.replaceState(null, '', url);
        }
      }

      buttons.forEach(button => {
        button.disabled = false;
        button.addEventListener('click', () => setLanguage(button.dataset.lang, true));
      });
      setLanguage(['ru', 'en'].includes(query) ? query : (['ru', 'en'].includes(saved) ? saved : 'ru'));
    })
    .catch(error => {
      console.warn('POLYUS language content unavailable; showing the Russian HTML fallback.', error);
    });
})();
