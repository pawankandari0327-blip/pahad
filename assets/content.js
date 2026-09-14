(() => {
  const SUPABASE_URL = 'https://bmvrryyrnjwsvcgstpgx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_DKkBIkCw4rwV3THJoDk8Yw_fYYe5Up6';
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  const esc = (v = '') =>
    String(v ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const strip = html => {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').trim();
  };

  const qs = new URLSearchParams(location.search);
  const id = qs.get('article');
  const slug = qs.get('slug');

  function loadSB() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) {
        return resolve(
          window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
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
              SUPABASE_KEY
            )
          );
        } catch (e) {
          reject(e);
        }
      };

      s.onerror = () =>
        reject(new Error('Supabase unavailable'));

      document.head.appendChild(s);
    });
  }

  function tagClass(category) {
    if (category === 'योजनाएं') return 'green-tag';
    if (category === 'किसान') return 'blue';
    if (category === 'वीडियो') return 'blue';
    if (category === 'महिला') return 'gold';
    if (category === 'शिक्षा') return 'gold';
    return 'red';
  }

  function articleUrl(article) {
    return `article.html?slug=${encodeURIComponent(
      article.slug || article.id
    )}`;
  }

  function dateText(value) {
    if (!value) return '';

    try {
      return new Intl.DateTimeFormat('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(value));
    } catch {
      return '';
    }
  }

  function setMeta(article) {
    const title =
      article.seo_title ||
      article.title ||
      'KATHYŪḌ — The New Pahad';

    const description =
      article.meta_description ||
      article.excerpt ||
      strip(article.body_html).slice(0, 155);

    document.title = `${title} — KATHYŪḌ`;

    function setMetaTag(name, content, attr = 'name') {
      let el = document.head.querySelector(
        `meta[${attr}="${name}"]`
      );

      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }

      el.setAttribute('content', content || '');
    }

    setMetaTag('description', description);

    setMetaTag(
      'og:title',
      article.og_title || title,
      'property'
    );

    setMetaTag(
      'og:description',
      article.og_description || description,
      'property'
    );

    setMetaTag(
      'og:type',
      'article',
      'property'
    );

    setMetaTag(
      'og:image',
      article.og_image ||
      article.image_url ||
      '',
      'property'
    );

    let canonical =
      document.head.querySelector(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href =
      article.canonical_url ||
      location.href;
  }

  function safeBody(html) {
    const box = document.createElement('div');

    box.innerHTML = html || '';

    box
      .querySelectorAll(
        'script,iframe,object,embed,form'
      )
      .forEach(el => el.remove());

    box.querySelectorAll('*').forEach(el => {
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

    return box.innerHTML;
  }

  async function getArticle(sb) {
    let query = sb
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .limit(1);

    if (id) {
      query = query.eq('id', id);
    } else if (slug) {
      query = query.eq('slug', slug);
    } else {
      return null;
    }

    const { data, error } =
      await query.maybeSingle();

    if (error) throw error;

    return data;
  }

  async function renderArticle() {
    const root =
      document.querySelector(
        '[data-article-root]'
      );

    if (!root) return;

    root.innerHTML = `
      <div class="content wrap">
        <div class="detail">
          <p>Article लोड हो रहा है…</p>
        </div>
      </div>
    `;

    try {
      const sb = await loadSB();
      const article = await getArticle(sb);

      if (!article) {
        root.innerHTML = `
          <div class="content wrap">
            <div class="detail">
              <h2>Article नहीं मिला</h2>
              <p>
                यह Article उपलब्ध नहीं है या प्रकाशित नहीं है।
              </p>
              <a class="button" href="news.html">
                आज की 10 पर जाएं
              </a>
            </div>
          </div>
        `;

        return;
      }

      setMeta(article);

      const cover = article.image_url
        ? `
          <img
            class="article-cover"
            src="${esc(article.image_url)}"
            alt="${esc(
              article.cover_alt ||
              article.title
            )}"
          >
        `
        : '';

      const video = article.video_url
        ? `
          <div class="article-video">
            <a
              href="${esc(article.video_url)}"
              target="_blank"
              rel="noopener"
            >
              ▶ वीडियो देखें
            </a>
          </div>
        `
        : '';

      let schemeFacts = '';

      if (article.content_type === 'scheme') {
        schemeFacts = `
          <div class="article-facts">
            <span>पात्रता</span>
            <span>लाभ</span>
            <span>आवेदन</span>
            <span>दस्तावेज</span>
          </div>

          <div class="scheme-sections">

            ${
              article.scheme_summary
                ? `
                  <section>
                    <h2>योजना क्या है?</h2>
                    <p>
                      ${esc(article.scheme_summary)}
                    </p>
                  </section>
                `
                : ''
            }

            ${
              article.eligibility
                ? `
                  <section>
                    <h2>पात्रता</h2>
                    <div>
                      ${safeBody(article.eligibility)}
                    </div>
                  </section>
                `
                : ''
            }

            ${
              article.not_eligible
                ? `
                  <section>
                    <h2>कौन पात्र नहीं है?</h2>
                    <div>
                      ${safeBody(article.not_eligible)}
                    </div>
                  </section>
                `
                : ''
            }

            ${
              article.benefits
                ? `
                  <section>
                    <h2>क्या लाभ मिलेगा?</h2>
                    <div>
                      ${safeBody(article.benefits)}
                    </div>
                  </section>
                `
                : ''
            }

            ${
              article.application_methods
                ? `
                  <section>
                    <h2>आवेदन के तरीके</h2>
                    <div>
                      ${safeBody(
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
                    <h2>आवेदन कैसे करें?</h2>
                    <div>
                      ${safeBody(
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
                    <h2>जरूरी दस्तावेज</h2>
                    <div>
                      ${safeBody(article.documents)}
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
                    <h2>आधिकारिक जानकारी</h2>

                    ${
                      article.department
                        ? `
                          <p>
                            <b>विभाग:</b>
                            ${esc(article.department)}
                          </p>
                        `
                        : ''
                    }

                    ${
                      article.official_source
                        ? `
                          <p>
                            <b>आधिकारिक स्रोत:</b>
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
                            <b>आवेदन:</b>
                            <a
                              href="${esc(
                                article.application_url
                              )}"
                              target="_blank"
                              rel="noopener"
                            >
                              आधिकारिक आवेदन लिंक →
                            </a>
                          </p>
                        `
                        : ''
                    }

                    ${
                      article.helpline
                        ? `
                          <p>
                            <b>हेल्पलाइन:</b>
                            ${esc(article.helpline)}
                          </p>
                        `
                        : ''
                    }

                  </section>
                `
                : ''
            }

          </div>
        `;
      }

      root.innerHTML = `
        <main class="article-page">

          <div class="wrap">

            <div class="article-shell">

              <article class="article-main">

                <div class="article-kicker">

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
                      <p class="article-lead">
                        ${esc(article.excerpt)}
                      </p>
                    `
                    : ''
                }

                ${cover}

                <div class="article-meta">
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

                ${schemeFacts}

                <div class="article-body">
                  ${safeBody(article.body_html)}
                </div>

                ${video}

              </article>

              <aside class="article-side">

                <div class="side">
                  <b>संबंधित जानकारी</b>

                  <p class="muted">
                    इस विषय से जुड़ी दूसरी खबरें
                    और जानकारी यहां दिखाई देंगी।
                  </p>
                </div>

              </aside>

            </div>

          </div>

        </main>
      `;

      renderRelated(sb, article);

    } catch (error) {
      console.error(
        'KATHYŪḌ Article:',
        error
      );

      root.innerHTML = `
        <div class="content wrap">
          <div class="detail">
            <h2>
              Article लोड नहीं हो पाया
            </h2>

            <p>
              कृपया कुछ देर बाद फिर कोशिश करें।
            </p>
          </div>
        </div>
      `;
    }
  }

  async function renderRelated(sb, article) {
    const box =
      document.querySelector(
        '.article-side'
      );

    if (!box) return;

    const { data } = await sb
      .from('articles')
      .select(
        'id,title,slug,category,section,image_url,published_at'
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
        { ascending: false }
      )
      .limit(5);

    if (!data?.length) return;

    box.innerHTML = `
      <div class="side">

        <b>और पढ़ें</b>

        <div class="related-list">

          ${data.map(item => `
            <a href="${articleUrl(item)}">

              <strong>
                ${esc(item.title)}
              </strong>

              <small>
                ${esc(
                  item.category ||
                  item.section ||
                  ''
                )}
              </small>

            </a>
          `).join('')}

        </div>

      </div>
    `;
  }

  async function renderListing() {
    const root =
      document.querySelector(
        '[data-list-root]'
      );

    if (!root) return;

    const section =
      root.dataset.section ||
      'आज की 10';

    try {
      const sb = await loadSB();

      const {
        data,
        error
      } = await sb
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
          content_type
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
          { ascending: true }
        )
        .order(
          'published_at',
          { ascending: false }
        )
        .limit(50);

      if (error) throw error;

      root.innerHTML =
        (data || [])
          .map((article, index) => `
            <a
              class="
                content-card
                ${
                  index === 0 &&
                  section === 'आज की 10'
                    ? 'content-card-featured'
                    : ''
                }
              "
              href="${articleUrl(article)}"
            >

              ${
                article.image_url
                  ? `
                    <div
                      class="content-card-img"
                      style="
                        background-image:
                          url('${esc(
                            article.image_url
                          )}');
                      "
                    ></div>
                  `
                  : `
                    <div
                      class="
                        content-card-img
                        content-card-placeholder
                      "
                    ></div>
                  `
              }

              <div class="content-card-body">

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
                  ${esc(article.title)}
                </h3>

                <p>
                  ${esc(
                    article.excerpt ||
                    strip(
                      article.title
                    ).slice(0, 160)
                  )}
                </p>

                <small>
                  ${esc(
                    dateText(
                      article.published_at
                    )
                  )}
                  · पढ़ें →
                </small>

              </div>

            </a>
          `)
          .join('') ||
        `
          <p class="muted">
            अभी कोई प्रकाशित Article नहीं है।
          </p>
        `;

    } catch (error) {
      console.error(
        'KATHYŪḌ Listing:',
        error
      );

      root.innerHTML = `
        <p class="muted">
          Content लोड नहीं हो पाया।
        </p>
      `;
    }
  }

  function start() {
    renderArticle();
    renderListing();
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
