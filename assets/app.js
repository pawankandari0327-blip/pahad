(() => {
  const SUPABASE_URL = 'https://bmvrryyrnjwsvcgstpgx.supabase.co';
  const KEY = 'sb_publishable_DKkBIkCw4rwV3THJoDk8Yw_fYYe5Up6';
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  if (window.__KATHYUD_UNIFIED__) return;
  window.__KATHYUD_UNIFIED__ = true;

  const esc = v =>
    String(v ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const text = html => {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').trim();
  };

  const qs = new URLSearchParams(location.search);
  const id = qs.get('article');
  const slug = qs.get('slug');

  const page =
    location.pathname.split('/').pop() || 'index.html';

  function initNav() {
    const nav = document.querySelector('.topbar nav');
    const menu = document.querySelector('.menu');

    if (menu && nav && !menu.dataset.bound) {
      menu.dataset.bound = '1';

      menu.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
    }

    const top = document.querySelector('.topbar');

    if (top) {
      const f = () => {
        top.classList.toggle(
          'scrolled',
          window.scrollY > 12
        );
      };

      window.addEventListener(
        'scroll',
        f,
        { passive: true }
      );

      f();
    }
  }

  function loadSupabase() {
    return new Promise((resolve, reject) => {

      if (window.supabase?.createClient) {
        return resolve(
          window.supabase.createClient(
            SUPABASE_URL,
            KEY
          )
        );
      }

      const s = document.createElement('script');

      s.src = CDN;

      s.onload = () => {
        try {
          resolve(
            window.supabase.createClient(
              SUPABASE_URL,
              KEY
            )
          );
        } catch (e) {
          reject(e);
        }
      };

      s.onerror = reject;

      document.head.appendChild(s);
    });
  }

  function dateText(value) {
    if (!value) return '';

    try {
      return new Intl.DateTimeFormat(
        'hi-IN',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      ).format(new Date(value));
    } catch {
      return '';
    }
  }

  function tagClass(category) {

    if (category === 'योजनाएं') {
      return 'green-tag';
    }

    if (
      category === 'किसान' ||
      category === 'वीडियो'
    ) {
      return 'blue';
    }

    if (category === '13 जिले') {
      return 'gold';
    }

    return 'red';
  }

  function articleUrl(article) {

    if (article.content_type === 'scheme') {
      return `scheme.html?slug=${encodeURIComponent(
        article.slug || article.id
      )}`;
    }

    return `news.html?slug=${encodeURIComponent(
      article.slug || article.id
    )}`;
  }

  function cleanBody(html) {

    const d = document.createElement('div');

    d.innerHTML = html || '';

    d.querySelectorAll(
      'script,iframe,object,embed,form'
    ).forEach(el => el.remove());

    d.querySelectorAll('*').forEach(el => {

      [...el.attributes].forEach(attr => {

        if (/^on/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }

      });

      if (el.tagName === 'A') {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
    });

    return d.innerHTML;
  }

  function setSEO(article) {

    const title =
      article.seo_title ||
      article.title ||
      'KATHYŪḌ — The New Pahad';

    const description =
      article.meta_description ||
      article.excerpt ||
      text(article.body_html)
        .slice(0, 155);

    document.title =
      `${title} — KATHYŪḌ`;

    let meta =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description;

    const properties = [
      [
        'og:title',
        article.og_title || title
      ],
      [
        'og:description',
        article.og_description ||
        description
      ],
      [
        'og:type',
        'article'
      ],
      [
        'og:image',
        article.og_image ||
        article.image_url ||
        ''
      ]
    ];

    properties.forEach(([name, value]) => {

      let el =
        document.querySelector(
          `meta[property="${name}"]`
        );

      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(
          'property',
          name
        );
        document.head.appendChild(el);
      }

      el.content = value || '';
    });

    let canonical =
      document.querySelector(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical =
        document.createElement('link');

      canonical.rel = 'canonical';

      document.head.appendChild(
        canonical
      );
    }

    canonical.href =
      article.canonical_url ||
      location.href;
  }

  async function getArticle(sb) {

    let query =
      sb
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .limit(1);

    if (id) {

      query =
        query.eq('id', id);

    } else if (slug) {

      query =
        query.eq('slug', slug);

    } else {

      return null;
    }

    const {
      data,
      error
    } = await query.maybeSingle();

    if (error) throw error;

    return data;
  }

  async function renderArticle() {

    if (
      !id &&
      !slug
    ) {
      return false;
    }

    if (
      page !== 'news.html' &&
      page !== 'scheme.html'
    ) {
      return false;
    }

    const root =
      document.querySelector(
        '.content'
      );

    if (!root) {
      return false;
    }

    try {

      const sb =
        await loadSupabase();

      const article =
        await getArticle(sb);

      if (!article) {

        root.innerHTML = `
          <div class="detail">

            <h2>Article नहीं मिला</h2>

            <p>
              यह Article उपलब्ध नहीं है
              या अभी प्रकाशित नहीं है।
            </p>

            <a
              class="button"
              href="news.html"
            >
              आज की 10 पर जाएं
            </a>

          </div>
        `;

        return true;
      }

      setSEO(article);

      const cover =
        article.image_url
          ? `
            <img
              class="k-cover"
              src="${esc(
                article.image_url
              )}"
              alt="${esc(
                article.cover_alt ||
                article.title
              )}"
            >
          `
          : '';

      const video =
        article.video_url
          ? `
            <div class="k-video">

              <a
                href="${esc(
                  article.video_url
                )}"
                target="_blank"
                rel="noopener"
              >
                ▶ वीडियो देखें
              </a>

            </div>
          `
          : '';

      let schemeInfo = '';

      if (
        article.content_type ===
        'scheme'
      ) {

        schemeInfo = `

          <div class="k-facts">

            <span>पात्रता</span>
            <span>लाभ</span>
            <span>आवेदन</span>
            <span>दस्तावेज</span>

          </div>

          ${
            article.scheme_summary
              ? `
                <section>
                  <h2>
                    योजना क्या है?
                  </h2>

                  <div>
                    ${cleanBody(
                      article.scheme_summary
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.eligibility
              ? `
                <section>
                  <h2>
                    पात्रता
                  </h2>

                  <div>
                    ${cleanBody(
                      article.eligibility
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.not_eligible
              ? `
                <section>
                  <h2>
                    कौन पात्र नहीं है?
                  </h2>

                  <div>
                    ${cleanBody(
                      article.not_eligible
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.benefits
              ? `
                <section>
                  <h2>
                    क्या लाभ मिलेगा?
                  </h2>

                  <div>
                    ${cleanBody(
                      article.benefits
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.application_methods
              ? `
                <section>
                  <h2>
                    आवेदन के तरीके
                  </h2>

                  <div>
                    ${cleanBody(
                      article.application_methods
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.application_steps
              ? `
                <section>
                  <h2>
                    आवेदन कैसे करें?
                  </h2>

                  <div>
                    ${cleanBody(
                      article.application_steps
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.documents
              ? `
                <section>
                  <h2>
                    जरूरी दस्तावेज
                  </h2>

                  <div>
                    ${cleanBody(
                      article.documents
                    )}
                  </div>
                </section>
              `
              : ''
          }

          ${
            article.department ||
            article.official_source ||
            article.application_url ||
            article.helpline
              ? `
                <section>

                  <h2>
                    आधिकारिक जानकारी
                  </h2>

                  ${
                    article.department
                      ? `
                        <p>
                          <b>
                            विभाग:
                          </b>

                          ${esc(
                            article.department
                          )}
                        </p>
                      `
                      : ''
                  }

                  ${
                    article.official_source
                      ? `
                        <p>
                          <b>
                            आधिकारिक स्रोत:
                          </b>

                          ${esc(
                            article.official_source
                          )}
                        </p>
                      `
                      : ''
                  }

                  ${
                    article.application_url
                      ? `
                        <p>

                          <a
                            href="${esc(
                              article.application_url
                            )}"
                            target="_blank"
                            rel="noopener"
                          >
                            आधिकारिक
                            आवेदन लिंक →
                          </a>

                        </p>
                      `
                      : ''
                  }

                  ${
                    article.helpline
                      ? `
                        <p>
                          <b>
                            हेल्पलाइन:
                          </b>

                          ${esc(
                            article.helpline
                          )}
                        </p>
                      `
                      : ''
                  }

                </section>
              `
              : ''
          }

        `;
      }

      root.innerHTML = `

        <article class="k-article">

          <div class="k-kicker">

            <span
              class="tag ${tagClass(
                article.category ||
                article.section
              )}"
            >
              ${esc(
                article.category ||
                article.section ||
                'उत्तराखंड'
              )}
            </span>

            <span>
              ${esc(
                dateText(
                  article.published_at ||
                  article.created_at
                )
              )}
            </span>

          </div>

          <h1>
            ${esc(article.title)}
          </h1>

          ${
            article.excerpt
              ? `
                <p class="k-lead">
                  ${esc(
                    article.excerpt
                  )}
                </p>
              `
              : ''
          }

          ${cover}

          <div class="k-byline">

            ${esc(
              article.author_name ||
              'KATHYŪḌ'
            )}

            ${
              article.source_name
                ? `
                  · स्रोत:
                  ${esc(
                    article.source_name
                  )}
                `
                : ''
            }

          </div>

          ${schemeInfo}

          <div class="k-body">

            ${cleanBody(
              article.body_html
            )}

          </div>

          ${video}

          <div
            id="kRelated"
            class="k-related"
          ></div>

        </article>
      `;

      await renderRelated(
        sb,
        article
      );

      return true;

    } catch (error) {

      console.error(
        'KATHYŪḌ Article:',
        error
      );

      root.innerHTML = `
        <div class="detail">

          <h2>
            Article लोड नहीं हो पाया
          </h2>

          <p>
            कृपया कुछ देर बाद
            फिर कोशिश करें।
          </p>

        </div>
      `;

      return true;
    }
  }

  async function renderRelated(
    sb,
    article
  ) {

    const box =
      document.querySelector(
        '#kRelated'
      );

    if (!box) return;

    const {
      data
    } = await sb
      .from('articles')
      .select(
        'id,title,slug,category,section,content_type,image_url,published_at'
      )
      .eq(
        'status',
        'published'
      )
      .eq(
        'section',
        article.section || ''
      )
      .neq(
        'id',
        article.id
      )
      .order(
        'published_at',
        {
          ascending: false
        }
      )
      .limit(4);

    if (!data?.length) {
      box.remove();
      return;
    }

    box.innerHTML = `

      <h2>
        और पढ़ें
      </h2>

      <div class="k-related-grid">

        ${data.map(item => `

          <a
            class="k-related-card"
            href="${articleUrl(
              item
            )}"
          >

            ${
              item.image_url
                ? `
                  <img
                    src="${esc(
                      item.image_url
                    )}"
                    alt=""
                  >
                `
                : ''
            }

            <span>
              ${esc(
                item.category ||
                item.section ||
                ''
              )}
            </span>

            <strong>
              ${esc(item.title)}
            </strong>

          </a>

        `).join('')}

      </div>
    `;
  }

  async function renderSection(
    section,
    selector,
    contentType = null
  ) {

    const box =
      document.querySelector(
        selector
      );

    if (!box) return;

    const sb =
      await loadSupabase();

    let query =
      sb
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          category,
          section,
          template,
          image_url,
          published_at,
          priority,
          content_type,
          video_url
        `)
        .eq(
          'status',
          'published'
        )
        .eq(
          'section',
          section
        )
        .order(
          'priority',
          {
            ascending: true
          }
        )
        .order(
          'published_at',
          {
            ascending: false
          }
        )
        .limit(50);

    if (contentType) {
      query =
        query.eq(
          'content_type',
          contentType
        );
    }

    const {
      data,
      error
    } = await query;

    if (error) throw error;

    if (
      !data ||
      !data.length
    ) {

      box.innerHTML = `
        <div class="notice">
          अभी कोई प्रकाशित
          Article नहीं है।
        </div>
      `;

      return;
    }

    box.innerHTML =
      data.map(article => `

        <a
          class="card ${
            article.content_type ===
            'video'
              ? 'video-card'
              : ''
          }"
          href="${articleUrl(
            article
          )}"
        >

          ${
            article.image_url
              ? `
                <div
                  class="k-card-img"
                  style="
                    background-image:
                      url('${esc(
                        article.image_url
                      )}');
                  "
                ></div>
              `
              : ''
          }

          <span
            class="
              tag
              ${tagClass(
                article.category ||
                section
              )}
            "
          >
            ${esc(
              article.category ||
              section
            )}
          </span>

          <h3>
            ${esc(
              article.title
            )}
          </h3>

          ${
            article.excerpt
              ? `
                <p>
                  ${esc(
                    article.excerpt
                  )}
                </p>
              `
              : ''
          }

          <b>
            ${
              article.content_type ===
              'video'
                ? '▶ वीडियो खोलें'
                : 'पूरी जानकारी →'
            }
          </b>

        </a>

      `).join('');
  }

  async function renderHome() {

    if (
      page !== 'index.html' &&
      !location.pathname.endsWith(
        '/pahad/'
      )
    ) {
      return;
    }

    try {

      const sb =
        await loadSupabase();

      const {
        data
      } = await sb
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          body_html,
          category,
          section,
          template,
          image_url,
          published_at,
          priority,
          content_type
        `)
        .eq(
          'status',
          'published'
        )
        .order(
          'priority',
          {
            ascending: true
          }
        )
        .order(
          'published_at',
          {
            ascending: false
          }
        )
        .limit(30);

      if (!data?.length) {
        return;
      }

      const news =
        document.querySelector(
          '.news-grid'
        );

      if (news) {

        news.innerHTML =
          data
            .slice(0, 10)
            .map(
              (article, index) => `

                <a
                  class="
                    news-card
                    ${
                      index === 0
                        ? 'featured'
                        : ''
                    }
                  "
                  href="${articleUrl(
                    article
                  )}"
                >

                  <span
                    class="
                      tag
                      ${tagClass(
                        article.category ||
                        article.section
                      )}
                    "
                  >
                    ${esc(
                      article.category ||
                      article.section ||
                      'उत्तराखंड'
                    )}
                  </span>

                  <h3>
                    ${esc(
                      article.title
                    )}
                  </h3>

                  ${
                    article.excerpt
                      ? `
                        <p>
                          ${esc(
                            article.excerpt
                          )}
                        </p>
                      `
                      : ''
                  }

                  <small>
                    ${esc(
                      dateText(
                        article.published_at
                      )
                    )}
                  </small>

                </a>
              `
            )
            .join('');
      }

      const schemeBox =
        document.querySelector(
          '.scheme-feature'
        );

      const schemes =
        data.filter(
          article =>
            article.content_type ===
              'scheme' ||
            article.section ===
              'योजनाएं'
        );

      if (
        schemeBox &&
        schemes.length
      ) {

        const scheme =
          schemes[0];

        schemeBox.href =
          articleUrl(
            scheme
          );

        const copy =
          schemeBox.querySelector(
            '.scheme-copy'
          );

        if (copy) {

          copy.innerHTML = `

            <span
              class="tag green-tag"
            >
              आज की योजना
            </span>

            <h3>
              ${esc(
                scheme.title
              )}
            </h3>

            <p>
              ${esc(
                scheme.excerpt ||
                text(
                  scheme.body_html
                ).slice(0, 220)
              )}
            </p>

            <div
              class="meta-row"
            >
              <span>
                पात्रता
              </span>

              <span>
                दस्तावेज
              </span>

              <span>
                आवेदन प्रक्रिया
              </span>
            </div>

            <b class="read">
              पूरी योजना समझें →
            </b>

          `;
        }

        const art =
          schemeBox.querySelector(
            '.scheme-art'
          );

        if (
          art &&
          scheme.image_url
        ) {

          art.style.background =
            `url("${scheme.image_url}") center/cover`;

        }
      }

    } catch (error) {

      console.warn(
        'KATHYŪḌ homepage:',
        error
      );
    }
  }

  async function renderSections() {

    try {

      if (
        page === 'news.html' &&
        !id &&
        !slug
      ) {

        await renderSection(
          'आज की 10',
          '.cards'
        );

      }

      if (
        page ===
        'schemes.html'
      ) {

        await renderSection(
          'योजनाएं',
          '.cards',
          'scheme'
        );

      }

      if (
        page ===
        'farmer.html'
      ) {

        await renderSection(
          'किसान',
          '.cards'
        );

      }

      if (
        page ===
        'videos.html'
      ) {

        await renderSection(
          'वीडियो',
          '.cards',
          'video'
        );

      }

    } catch (error) {

      console.warn(
        'KATHYŪḌ sections:',
        error
      );
    }
  }

  async function start() {

    initNav();

    const detail =
      await renderArticle();

    if (!detail) {

      await renderHome();

      await renderSections();

    }
  }

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start
    );

  } else {

    start();

  }

})();
