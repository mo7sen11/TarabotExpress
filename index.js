/* Keep --header-h in sync with the real sticky header height. */
function setHeaderHeight(){
  const header = document.querySelector('header');
  if(header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
}
setHeaderHeight();
window.addEventListener('load', setHeaderHeight);
window.addEventListener('resize', setHeaderHeight);
if(document.fonts && document.fonts.ready){ document.fonts.ready.then(setHeaderHeight); }

const burger = document.getElementById('burger');
const mainNav = document.getElementById('mainNav');
if(burger && mainNav){
  burger.addEventListener('click', () => mainNav.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));
}

function toggleFaq(btn){
  const item = btn.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}

/* ===== Smooth infinite branches carousel: exactly 7 cards ===== */
(function(){
  const track = document.getElementById('branchTrack');
  if(!track) return;
  const viewport = track.parentElement;

  /* Keep the first 5 real cards and remove the old duplicated set. */
  Array.from(track.querySelectorAll('.branch-card')).slice(5).forEach(card => card.remove());

  /* Add 2 placeholder branches. You can change their name, image and Maps URL later. */
  const extraBranches = [
    {
      name:'Maxim Mall',
      city:'New Cairo',
      image:'https://picsum.photos/seed/maximmall/400/300',
      map:'https://www.google.com/maps/search/?api=1&query=Tarabot+Express+Maxim+Mall+New+Cairo'
    },
    {
      name:'Nasr City',
      city:'Cairo',
      image:'https://picsum.photos/seed/nasrcity/400/300',
      map:'https://www.google.com/maps/search/?api=1&query=Tarabot+Express+Nasr+City+Cairo'
    }
  ];

  extraBranches.forEach(branch => {
    const card = document.createElement('a');
    card.className = 'branch-card';
    card.href = branch.map;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', `Open ${branch.name} in Google Maps`);
    card.innerHTML = `
      <div class="img-wrap"><img src="${branch.image}" alt="${branch.name} branch" loading="lazy"></div>
      <div class="info"><h4>${branch.name}</h4><span>📍 ${branch.city}</span></div>`;
    track.appendChild(card);
  });

  /* CSS required for a smooth clipped carousel without editing the HTML/CSS files. */
  viewport.style.overflow = 'hidden';
  viewport.style.padding = '8px 0 18px';
  track.style.display = 'flex';
  track.style.width = 'max-content';
  track.style.willChange = 'transform';
  track.style.transform = 'translate3d(0,0,0)';
  track.style.scrollBehavior = 'auto';
  track.style.overflow = 'visible';

  let timer = null;
  let paused = false;
  let isAnimating = false;
  const interval = 2600;
  const duration = 750;

  function getStep(){
    const card = track.querySelector('.branch-card');
    if(!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function next(){
    if(paused || isAnimating || track.children.length < 2) return;
    const step = getStep();
    if(!step) return;

    isAnimating = true;
    track.style.transition = `transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;
    track.style.transform = `translate3d(${-step}px,0,0)`;

    const onEnd = event => {
      if(event.propertyName !== 'transform') return;
      track.removeEventListener('transitionend', onEnd);
      track.style.transition = 'none';
      track.appendChild(track.firstElementChild);
      track.style.transform = 'translate3d(0,0,0)';
      track.getBoundingClientRect();
      isAnimating = false;
    };
    track.addEventListener('transitionend', onEnd);
  }

  function start(){
    stop();
    timer = setInterval(next, interval);
  }
  function stop(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  viewport.addEventListener('mouseenter', () => paused = true);
  viewport.addEventListener('mouseleave', () => paused = false);
  viewport.addEventListener('touchstart', () => paused = true, {passive:true});
  viewport.addEventListener('touchend', () => paused = false, {passive:true});
  viewport.addEventListener('touchcancel', () => paused = false, {passive:true});
  window.addEventListener('resize', () => {
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    isAnimating = false;
  });

  start();
})();

/* ===== Scrollspy ===== */
(function(){
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 86;
    const markerY = window.scrollY + headerH + (window.innerHeight - headerH) * 0.40;
    let currentIndex = 0;
    sections.forEach((section, index) => { if(markerY >= section.offsetTop) currentIndex = index; });
    navLinks.forEach(link => link.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  onScroll();
})();

/* ===== Gallery image preview box ===== */
(function(){
  const lightbox = document.getElementById('galleryLightbox');
  const previewBox = document.getElementById('galleryPreviewBox');
  const closeButton = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if(!lightbox || !previewBox || !closeButton || !galleryItems.length) return;

  function openLightbox(image){
    const imageUrl = image.currentSrc || image.src;
    previewBox.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => { if(!lightbox.classList.contains('open')) previewBox.style.backgroundImage = ''; }, 350);
  }
  galleryItems.forEach(item => item.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation();
    const image = item.querySelector('img');
    if(image) openLightbox(image);
  }));
  closeButton.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); closeLightbox(); });
  lightbox.addEventListener('click', event => { if(event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });
})();

/* ===== GO TO TOP: appears after the hero leaves the viewport ===== */
(function(){
  const hero = document.getElementById('home');
  if(!hero) return;

  const style = document.createElement('style');
  style.textContent = `
    .go-top{position:fixed;right:24px;bottom:24px;z-index:1200;width:48px;height:48px;border:0;border-radius:50%;background:var(--gold,#F5A623);color:var(--navy,#0B1229);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 12px 30px rgba(11,18,41,.22);opacity:0;visibility:hidden;transform:translateY(18px) scale(.9);pointer-events:none;transition:opacity .25s ease,transform .25s ease,visibility .25s ease,background .2s ease}.go-top.show{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}.go-top:hover{background:var(--gold-dark,#E0941A);transform:translateY(-4px)}.go-top:focus-visible{outline:3px solid rgba(245,166,35,.35);outline-offset:3px}@media(max-width:768px){.go-top{right:16px;bottom:16px;width:46px;height:46px}}
  `;
  document.head.appendChild(style);

  const goTop = document.createElement('button');
  goTop.className = 'go-top';
  goTop.type = 'button';
  goTop.setAttribute('aria-label','Go to top');
  goTop.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  document.body.appendChild(goTop);

  function updateGoTop(){
    goTop.classList.toggle('show', hero.getBoundingClientRect().bottom <= 0);
  }
  window.addEventListener('scroll', updateGoTop, {passive:true});
  window.addEventListener('resize', updateGoTop);
  updateGoTop();
  goTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
})();
