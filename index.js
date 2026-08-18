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
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(setHeaderHeight); }

  const burger = document.getElementById('burger');
  const mainNav = document.getElementById('mainNav');
  burger.addEventListener('click', () => mainNav.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));

  function toggleFaq(btn){
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  }

    /* ===== Infinite branches carousel: 5 real cards, no duplicates ===== */
  (function(){
    const track = document.getElementById('branchTrack');
    const viewport = track ? track.parentElement : null;
    if(!track || !viewport) return;

    let timer = null;
    let paused = false;
    let isAnimating = false;
    const interval = 2600;
    const duration = 650;

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
      track.style.transition = `transform ${duration}ms cubic-bezier(.2,.7,.2,1)`;
      track.style.transform = `translate3d(${-step}px,0,0)`;

      track.addEventListener('transitionend', function onEnd(){
        track.removeEventListener('transitionend', onEnd);
        track.style.transition = 'none';
        track.appendChild(track.firstElementChild);
        track.style.transform = 'translate3d(0,0,0)';
        // Force the browser to commit the reset before enabling animation again.
        track.offsetHeight;
        isAnimating = false;
      }, {once:true});
    }

    function start(){
      stop();
      timer = setInterval(next, interval);
    }
    function stop(){
      if(timer){ clearInterval(timer); timer = null; }
    }

    viewport.addEventListener('mouseenter', () => { paused = true; });
    viewport.addEventListener('mouseleave', () => { paused = false; });
    viewport.addEventListener('touchstart', () => { paused = true; }, {passive:true});
    viewport.addEventListener('touchend', () => { paused = false; }, {passive:true});
    viewport.addEventListener('touchcancel', () => { paused = false; }, {passive:true});

    window.addEventListener('resize', () => {
      track.style.transition = 'none';
      track.style.transform = 'translate3d(0,0,0)';
      isAnimating = false;
    });

    start();
  })();

  /* ===== Scrollspy: activate section when it reaches 40% of viewport ===== */
  (function(){
    const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
    const sections = navLinks
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    function onScroll(){
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 86;
      const markerY = window.scrollY + headerH + (window.innerHeight - headerH) * 0.40;
      let currentIndex = 0;

      sections.forEach((section, index) => {
        if(markerY >= section.offsetTop) currentIndex = index;
      });

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
      setTimeout(() => {
        if(!lightbox.classList.contains('open')){
          previewBox.style.backgroundImage = '';
        }
      }, 350);
    }

    galleryItems.forEach(item => {
      item.addEventListener('click', function(event){
        event.preventDefault();
        event.stopPropagation();

        const image = item.querySelector('img');
        if(image) openLightbox(image);
      });
    });

    closeButton.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      closeLightbox();
    });

    // Close only when clicking the backdrop, not the preview box.
    lightbox.addEventListener('click', function(event){
      if(event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape' && lightbox.classList.contains('open')){
        closeLightbox();
      }
    });
  })();
