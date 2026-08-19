/* Keep --header-h in sync with the real sticky header height. */
function setHeaderHeight(){
  const header = document.querySelector('header');
  if(header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
}
setHeaderHeight();
window.addEventListener('load', setHeaderHeight);
window.addEventListener('resize', setHeaderHeight);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderHeight);

/* ===== MOBILE MENU ===== */
const burger = document.getElementById('burger');
const mainNav = document.getElementById('mainNav');
if(burger && mainNav){
  burger.addEventListener('click', () => mainNav.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a =>
    a.addEventListener('click', () => mainNav.classList.remove('open'))
  );
}

/* ===== FAQ ===== */
function toggleFaq(btn){
  const item = btn.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

/* ===== Smooth infinite branches carousel ===== */
(function(){
  const track = document.getElementById('branchTrack');
  const prevBtn = document.getElementById('branchPrev');
  const nextBtn = document.getElementById('branchNext');
  if(!track) return;

  // Keep the position in a separate variable. This fixes the old 0.45px/frame
  // problem where some browsers round scrollLeft and the carousel never moves.
  const AUTO_SPEED = 28; // pixels per second
  const BUTTON_DURATION = 500;
  let autoScroll = true;
  let dragging = false;
  let lastTime = null;
  let virtualScroll = track.scrollLeft;
  let pauseTimer = null;
  let manualAnimating = false;

  function getGap(){
    const styles = getComputedStyle(track);
    return parseFloat(styles.columnGap || styles.gap) || 0;
  }

  function getStep(){
    const firstCard = track.querySelector('.branch-card');
    return firstCard ? firstCard.getBoundingClientRect().width + getGap() : 240;
  }

  function syncVirtualScroll(){
    virtualScroll = track.scrollLeft;
  }

  function pauseAuto(ms = 1800){
    autoScroll = false;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      if(!dragging && !manualAnimating){
        syncVirtualScroll();
        autoScroll = true;
      }
    }, ms);
  }

  function recycleForward(){
    const step = getStep();
    if(virtualScroll >= step && track.firstElementChild){
      virtualScroll -= step;
      track.appendChild(track.firstElementChild);
      track.scrollLeft = virtualScroll;
    }
  }

  function normalizeAfterDrag(){
    const step = getStep();
    while(track.scrollLeft >= step && track.firstElementChild){
      track.scrollLeft -= step;
      track.appendChild(track.firstElementChild);
    }
    while(track.scrollLeft < 0 && track.lastElementChild){
      track.prepend(track.lastElementChild);
      track.scrollLeft += step;
    }
    syncVirtualScroll();
  }

  function animate(time){
    if(lastTime === null) lastTime = time;
    const delta = Math.min(50, time - lastTime);
    lastTime = time;

    if(autoScroll && !dragging && !manualAnimating){
      virtualScroll += AUTO_SPEED * (delta / 1000);
      track.scrollLeft = virtualScroll;
      recycleForward();
    }

    requestAnimationFrame(animate);
  }

  function moveNext(){
    if(manualAnimating) return;
    manualAnimating = true;
    autoScroll = false;
    clearTimeout(pauseTimer);

    const step = getStep();
    track.scrollTo({ left: step, behavior: 'smooth' });

    setTimeout(() => {
      track.appendChild(track.firstElementChild);
      track.scrollLeft = 0;
      virtualScroll = 0;
      manualAnimating = false;
      pauseAuto(900);
    }, BUTTON_DURATION);
  }

  function movePrev(){
    if(manualAnimating) return;
    manualAnimating = true;
    autoScroll = false;
    clearTimeout(pauseTimer);

    const step = getStep();
    track.prepend(track.lastElementChild);
    track.scrollLeft = step;
    virtualScroll = step;

    requestAnimationFrame(() => {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    });

    setTimeout(() => {
      track.scrollLeft = 0;
      virtualScroll = 0;
      manualAnimating = false;
      pauseAuto(900);
    }, BUTTON_DURATION);
  }

  nextBtn?.addEventListener('click', moveNext);
  prevBtn?.addEventListener('click', movePrev);

  track.addEventListener('mouseenter', () => {
    if(!manualAnimating) autoScroll = false;
  });
  track.addEventListener('mouseleave', () => {
    if(!dragging && !manualAnimating){
      syncVirtualScroll();
      autoScroll = true;
    }
  });

  track.addEventListener('pointerdown', () => {
    dragging = true;
    autoScroll = false;
  });
  track.addEventListener('pointerup', () => {
    dragging = false;
    normalizeAfterDrag();
    pauseAuto(700);
  });
  track.addEventListener('pointercancel', () => {
    dragging = false;
    normalizeAfterDrag();
    pauseAuto(700);
  });

  window.addEventListener('blur', () => autoScroll = false);
  window.addEventListener('focus', () => {
    if(!dragging && !manualAnimating){
      syncVirtualScroll();
      autoScroll = true;
    }
  });

  requestAnimationFrame(animate);
})();

/* ===== Scrollspy ===== */
(function(){
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  function onScroll(){
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 86;
    const markerY = window.scrollY + headerH + (window.innerHeight - headerH) * .4;
    let currentIndex = 0;
    sections.forEach((section,index) => {
      if(markerY >= section.offsetTop) currentIndex = index;
    });
    navLinks.forEach(link => link.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
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
    previewBox.style.backgroundImage = `url("${(image.currentSrc || image.src).replace(/"/g,'\\"')}")`;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => {
      if(!lightbox.classList.contains('open')) previewBox.style.backgroundImage = '';
    }, 350);
  }

  galleryItems.forEach(item => item.addEventListener('click', e => {
    e.preventDefault();
    const image = item.querySelector('img');
    if(image) openLightbox(image);
  }));
  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

/* ===== Go to top ===== */
(function(){
  const goTop = document.getElementById('goTop');
  const hero = document.querySelector('.hero');
  if(!goTop || !hero) return;

  function updateGoTop(){
    goTop.classList.toggle('show', hero.getBoundingClientRect().bottom <= 0);
  }

  goTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', updateGoTop, {passive:true});
  window.addEventListener('resize', updateGoTop);
  updateGoTop();
})();
