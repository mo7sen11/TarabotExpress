/* Keep --header-h in sync with the real sticky header height,
     so hero is exactly (100vh - header) and anchor scrolling/scroll-margin
     never lands sections underneath the sticky header. */
  function setHeaderHeight(){
    const header = document.querySelector('header');
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
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

    const speed = 0.45; // lower = slower and smoother
    let autoScroll = true;
    let rafId = null;
    let lastTime = null;
    let pauseTimer = null;
    let dragging = false;

    function getGap(){
      const styles = getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap) || 0;
    }

    function getStep(){
      const firstCard = track.querySelector('.branch-card');
      return firstCard ? firstCard.getBoundingClientRect().width + getGap() : 240;
    }

    function pauseAuto(ms = 1800){
      autoScroll = false;
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => { autoScroll = !dragging; }, ms);
    }

    function keepInfinite(direction){
      const first = track.firstElementChild;
      const last = track.lastElementChild;
      const step = getStep();

      if(direction === 'forward' && track.scrollLeft >= step){
        track.scrollLeft -= step;
        track.appendChild(first);
      }

      if(direction === 'backward' && track.scrollLeft <= 0 && last){
        track.prepend(last);
        track.scrollLeft += step;
      }
    }

    function animate(time){
      if(lastTime === null) lastTime = time;
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      if(autoScroll && !dragging){
        track.scrollLeft += speed * (delta / 16.67);
        keepInfinite('forward');
      }

      rafId = requestAnimationFrame(animate);
    }

    function moveNext(){
      pauseAuto();
      const step = getStep();
      track.scrollBy({ left: step, behavior: 'smooth' });

      window.setTimeout(() => {
        if(track.scrollLeft >= step - 2){
          track.scrollLeft -= step;
          track.appendChild(track.firstElementChild);
        }
      }, 520);
    }

    function movePrev(){
      pauseAuto();
      const step = getStep();

      track.prepend(track.lastElementChild);
      track.scrollLeft += step;
      track.scrollBy({ left: -step, behavior: 'smooth' });

      window.setTimeout(() => {
        if(track.scrollLeft <= 2){
          track.scrollLeft += step;
        }
      }, 520);
    }

    function ensureBackInfinite(){
      const step = getStep();
      if(track.scrollLeft <= 0){
        track.prepend(track.lastElementChild);
        track.scrollLeft += step;
      }
    }

    nextBtn?.addEventListener('click', moveNext);
    prevBtn?.addEventListener('click', movePrev);

    track.addEventListener('mouseenter', () => autoScroll = false);
    track.addEventListener('mouseleave', () => {
      if(!dragging) autoScroll = true;
    });

    track.addEventListener('pointerdown', () => {
      dragging = true;
      autoScroll = false;
    });
    track.addEventListener('pointerup', () => {
      dragging = false;
      ensureBackInfinite();
      pauseAuto(900);
    });
    track.addEventListener('pointercancel', () => {
      dragging = false;
      pauseAuto(900);
    });

    track.addEventListener('touchstart', () => {
      dragging = true;
      autoScroll = false;
    }, {passive:true});

    track.addEventListener('touchend', () => {
      dragging = false;
      ensureBackInfinite();
      pauseAuto(900);
    }, {passive:true});

    track.addEventListener('scroll', () => {
      if(!dragging && !autoScroll) ensureBackInfinite();
    }, {passive:true});

    window.addEventListener('blur', () => autoScroll = false);
    window.addEventListener('focus', () => {
      if(!dragging) autoScroll = true;
    });

    rafId = requestAnimationFrame(animate);
    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
  })();

  /* ===== Scrollspy ===== */
  (function(){
    const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
    const sections = navLinks
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

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
    lightbox.addEventListener('click', e => {
      if(e.target === lightbox) closeLightbox();
    });
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
      const heroBottom = hero.getBoundingClientRect().bottom;
      goTop.classList.toggle('show', heroBottom <= 0);
    }

    goTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateGoTop, {passive:true});
    window.addEventListener('resize', updateGoTop);
    updateGoTop();
  })();
