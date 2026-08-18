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

  /* ===== Infinite branches slider (auto-scroll only) ===== */
  (function(){
    const track = document.getElementById('branchTrack');
    let halfWidth = 0;
    let autoScroll = true;
    const speed = 0.6; // px per frame

    function measure(){ halfWidth = track.scrollWidth / 2; }
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    measure();

    function loop(){
      if(autoScroll){
        track.scrollLeft += speed;
        if(track.scrollLeft >= halfWidth){ track.scrollLeft -= halfWidth; }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    track.addEventListener('mouseenter', () => autoScroll = false);
    track.addEventListener('mouseleave', () => autoScroll = true);
    track.addEventListener('touchstart', () => autoScroll = false, {passive:true});
    track.addEventListener('touchend', () => autoScroll = true, {passive:true});
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
