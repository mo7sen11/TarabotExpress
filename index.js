/* Keep --header-h in sync with the real sticky header height. */
function setHeaderHeight(){
  const header = document.querySelector('header');
  if(header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
}
setHeaderHeight();
window.addEventListener('load', setHeaderHeight);
window.addEventListener('resize', setHeaderHeight);
if(document.fonts && document.fonts.ready){ document.fonts.ready.then(setHeaderHeight); }

/* Load the added enhancements CSS without replacing the existing style.css. */
(function(){
  if(!document.querySelector('link[href="enhancements.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='enhancements.css';
    document.head.appendChild(link);
  }
})();

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

/* ===== SMOOTH INFINITE BRANCHES CAROUSEL: EXACTLY 7 CARDS ===== */
(function(){
  const track = document.getElementById('branchTrack');
  if(!track) return;
  const viewport = track.parentElement;

  /* Keep only the original 5 cards, then add 2 placeholders. */
  Array.from(track.querySelectorAll('.branch-card')).slice(5).forEach(card => card.remove());

  const extraBranches = [
    {name:'Maxim Mall',city:'New Cairo',image:'https://picsum.photos/seed/maximmall/400/300',map:'https://www.google.com/maps/search/?api=1&query=Maxim+Mall+New+Cairo'},
    {name:'Nasr City',city:'Cairo',image:'https://picsum.photos/seed/nasrcity/400/300',map:'https://www.google.com/maps/search/?api=1&query=Nasr+City+Cairo'}
  ];

  extraBranches.forEach(branch=>{
    const card=document.createElement('a');
    card.className='branch-card';
    card.href=branch.map;
    card.target='_blank';
    card.rel='noopener noreferrer';
    card.setAttribute('aria-label',`Open ${branch.name} in Google Maps`);
    card.innerHTML=`<div class="img-wrap"><img src="${branch.image}" alt="${branch.name} branch" loading="lazy"></div><div class="info"><h4>${branch.name}</h4><span>📍 ${branch.city}</span></div>`;
    track.appendChild(card);
  });

  viewport.style.overflow='hidden';
  track.style.overflow='visible';
  track.style.transform='translate3d(0,0,0)';
  track.style.willChange='transform';

  let timer=null;
  let paused=false;
  let animating=false;
  const interval=2800;
  const duration=900;

  function stepSize(){
    const first=track.querySelector('.branch-card');
    if(!first) return 0;
    const gap=parseFloat(getComputedStyle(track).gap)||0;
    return Math.round(first.getBoundingClientRect().width+gap);
  }

  function moveNext(){
    if(paused||animating||track.children.length<2) return;
    const step=stepSize();
    if(!step) return;

    animating=true;
    track.style.transition=`transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;
    requestAnimationFrame(()=>{track.style.transform=`translate3d(${-step}px,0,0)`;});

    const done=event=>{
      if(event.target!==track||event.propertyName!=='transform') return;
      track.removeEventListener('transitionend',done);
      track.style.transition='none';
      track.appendChild(track.firstElementChild);
      track.style.transform='translate3d(0,0,0)';
      void track.offsetWidth;
      animating=false;
    };
    track.addEventListener('transitionend',done);
  }

  function start(){
    if(timer) clearInterval(timer);
    timer=setInterval(moveNext,interval);
  }

  viewport.addEventListener('mouseenter',()=>paused=true);
  viewport.addEventListener('mouseleave',()=>paused=false);
  viewport.addEventListener('touchstart',()=>paused=true,{passive:true});
  viewport.addEventListener('touchend',()=>paused=false,{passive:true});
  viewport.addEventListener('touchcancel',()=>paused=false,{passive:true});
  window.addEventListener('resize',()=>{
    track.style.transition='none';
    track.style.transform='translate3d(0,0,0)';
    animating=false;
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
    lightbox.classList.add('open'); document.body.classList.add('lightbox-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open'); document.body.classList.remove('lightbox-open');
    setTimeout(()=>{if(!lightbox.classList.contains('open')) previewBox.style.backgroundImage='';},350);
  }
  galleryItems.forEach(item=>item.addEventListener('click',event=>{
    event.preventDefault(); event.stopPropagation();
    const image=item.querySelector('img'); if(image) openLightbox(image);
  }));
  closeButton.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();closeLightbox();});
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&lightbox.classList.contains('open'))closeLightbox();});
})();

/* ===== GO TO TOP ===== */
(function(){
  const hero=document.getElementById('home');
  if(!hero) return;
  let goTop=document.getElementById('goTop');
  if(!goTop){
    goTop=document.createElement('button');
    goTop.id='goTop';
    goTop.className='go-top';
    goTop.type='button';
    goTop.setAttribute('aria-label','Go to top');
    goTop.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    document.body.appendChild(goTop);
  }
  function updateGoTop(){goTop.classList.toggle('show',hero.getBoundingClientRect().bottom<=0);}
  window.addEventListener('scroll',updateGoTop,{passive:true});
  window.addEventListener('resize',updateGoTop);
  updateGoTop();
  goTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
