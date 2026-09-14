(() => {
  const SUPABASE_URL = 'https://bmvrryyrnjwsvcgstpgx.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DKkBIkCw4rwV3THJoDk8Yw_fYYe5Up6';

  const nav = document.querySelector('.topbar nav');
  const menu = document.querySelector('.menu');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const topbar = document.querySelector('.topbar');

  const onScroll = () => {
    if (topbar) {
      topbar.classList.toggle('scrolled', window.scrollY > 12);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const reveal = document.querySelectorAll(
    '.section-head,.intro>div,.intro>p,.tiles,.news-grid,.scheme-feature,.farmer-layout,.district-home,.footer-grid'
  );

  reveal.forEach(el => el.setAttribute('data-reveal', ''));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('visible'));
  }

  const dailyHero = document.getElementById('dailyHero');
  const mountainCaption = document.getElementById('mountainCaption');

  if (dailyHero) {
    const dailyImages = [
      {
        name: 'NANDA DEVI · AULI',
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Nanda_Devi.jpg?width=2400'
      },
      {
        name: 'NANDA DEVI · SILHOUETTE',
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Nanda_devi_in_silhouette.jpg?width=2400'
      },
      {
        name: 'VALLEY OF FLOWERS · CHAMOLI',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Valley_of_Flowers.jpg?width=2400'
      },
      {
        name: 'VALLEY OF FLOWERS · HIMALAYAS',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg?width=2400'
      },
      {
        name: 'AULI · CHAMOLI',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Auli_Himalayas.jpg?width=2400'
      },
      {
        name: 'NANDA DEVI · AULI · 2025',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nanda_Devi_Peak-9th_july%2C2025.jpg?width=2400'
      }
    ];

    const day = Math.floor(Date.now() / 86400000);

    const item =
      dailyImages[
        ((day % dailyImages.length) + dailyImages.length) %
          dailyImages.length
      ];

    dailyHero.style.backgroundImage = `url("${item.url}")`;

    if (mountainCaption) {
      mountainCaption.innerHTML =
        `${item.name} <span>• आज की तस्वीर</span>`;
    }
  }

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        return resolve(window.supabase);
      }

      const script = document.createElement('script');

      script.src =
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

      script.onload = () => {
        try {
          const client = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
          );

          resolve(client);
        } catch (err) {
          reject(err);
        }
      };

      script.onerror = () => {
        reject(new Error('Supabase library load failed'));
      };

      document.head.appendChild(script);
    });
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[ch]));
  }

  function safeArticleText(html) {
    const box = document.createElement('div');

    box.innerHTML = html || '';

    return (box.textContent || box.innerText || '').trim();
  }

  function tagClass(category) {
    if (category === 'किसान') return 'blue';
    if (category === 'योजनाएं') return 'green-tag';
    if (category === '13 जिले') return 'gold';
    if (category === 'वीडियो') return 'blue';

    return 'red';
  }

  function articleHref(article) {
    return `news.html?article=${encodeURIComponent(article.id)}`;
  }

  function renderLiveNews(articles) {
    const grid = document.querySelector('.news-grid');

    if (!grid || !articles.length) return;

    grid.innerHTML = articles
      .slice(0, 10)
      .map((article, index) => {
        const title = escapeHTML(article.title);

        const category = escapeHTML(
          article.category || 'उत्तराखंड'
        );

        const excerpt = escapeHTML(
          article.excerpt ||
          safeArticleText(article.body_html || '').slice(0, 145)
        );

        return `
          <a class="news-card ${index === 0 ? 'featured' : ''}" href="${articleHref(article)}">
            <span class="tag ${tagClass(article.category)}">${category}</span>
            <h3>${title}</h3>
            ${excerpt ? `<p>${excerpt}</p>` : ''}
            <small>आज · KATHYŪḌ</small>
          </a>
        `;
      })
      .join('');
  }

  function renderTodayScheme(articles) {
    const feature = document.querySelector('.scheme-feature');

    if (!feature) return;

    const scheme = articles.find(
      a => a.category === 'योजनाएं'
    );

    if (!scheme) return;

    const copy = feature.querySelector('.scheme-copy');

    if (!copy) return;

    const title = escapeHTML(scheme.title);

    const text = escapeHTML(
      scheme.excerpt ||
      safeArticleText(scheme.body_html || '').slice(0, 220)
    );

    copy.innerHTML = `
      <span class="tag green-tag">आज की योजना</span>
      <h3>${title}</h3>
      ${text ? `<p>${text}</p>` : ''}
      <div class="meta-row">
        <span>पात्रता</span>
        <span>दस्तावेज</span>
        <span>आवेदन प्रक्रिया</span>
      </div>
      <b class="read">पूरी योजना समझें →</b>
    `;

    feature.href =
      `scheme.html?article=${encodeURIComponent(scheme.id)}`;

    if (scheme.image_url) {
      const art = feature.querySelector('.scheme-art');

      if (art) {
        art.style.backgroundImage =
          `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.18)), url("${scheme.image_url}")`;

        art.style.backgroundSize = 'cover';
        art.style.backgroundPosition = 'center';
      }
    }
  }

  async function loadLiveContent() {
    try {
      const sb = await loadSupabase();

      const { data, error } = await sb
        .from('articles')
        .select(
          'id,title,excerpt,body_html,category,priority,template,status,image_url,video_url,published_at'
        )
        .eq('status', 'published')
        .order('priority', { ascending: true })
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn(
          'KATHYŪḌ Supabase:',
          error.message
        );

        return;
      }

      if (!data || !data.length) return;

      renderLiveNews(data);
      renderTodayScheme(data);

    } catch (err) {
      console.warn(
        'KATHYŪḌ live content unavailable:',
        err
      );
    }
  }

  loadLiveContent();

})();
