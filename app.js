(() => {
  const nav = document.querySelector('.topbar nav');
  const menu = document.querySelector('.menu');
  if (menu && nav) menu.addEventListener('click', () => nav.classList.toggle('open'));

  const topbar = document.querySelector('.topbar');
  const onScroll = () => topbar && topbar.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  const reveal = document.querySelectorAll('.section-head,.intro>div,.intro>p,.tiles,.news-grid,.scheme-feature,.farmer-layout,.district-home,.footer-grid');
  reveal.forEach(el => el.setAttribute('data-reveal',''));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}), {threshold:.12});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));

  // Daily Uttarakhand hero: one image per calendar day.
  // Images are hosted on Wikimedia Commons under their respective licenses.
  const dailyHero = document.getElementById('dailyHero');
  const mountainCaption = document.getElementById('mountainCaption');
  if (dailyHero) {
    const dailyImages = [
      {name:'NANDA DEVI · AULI', url:'https://upload.wikimedia.org/wikipedia/commons/1/1c/Nanda_Devi.jpg?width=2400'},
      {name:'NANDA DEVI · SILHOUETTE', url:'https://upload.wikimedia.org/wikipedia/commons/f/f4/Nanda_devi_in_silhouette.jpg?width=2400'},
      {name:'VALLEY OF FLOWERS · CHAMOLI', url:'https://commons.wikimedia.org/wiki/Special:FilePath/Valley_of_Flowers.jpg?width=2400'},
      {name:'VALLEY OF FLOWERS · HIMALAYAS', url:'https://commons.wikimedia.org/wiki/Special:FilePath/Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg?width=2400'},
      {name:'AULI · CHAMOLI', url:'https://commons.wikimedia.org/wiki/Special:FilePath/Auli_Himalayas.jpg?width=2400'},
      {name:'NANDA DEVI · AULI · 2025', url:'https://commons.wikimedia.org/wiki/Special:FilePath/Nanda_Devi_Peak-9th_july%2C2025.jpg?width=2400'}
    ];
    const day = Math.floor(Date.now() / 86400000);
    const item = dailyImages[((day % dailyImages.length) + dailyImages.length) % dailyImages.length];
    dailyHero.style.backgroundImage = `url("${item.url}")`;
    if (mountainCaption) mountainCaption.innerHTML = `${item.name} <span>• आज की तस्वीर</span>`;
  }

})();
