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
})();
