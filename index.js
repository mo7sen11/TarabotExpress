/* Keep --header-h in sync with the real sticky header height. */
function setHeaderHeight(){
  const header=document.querySelector('header');
  if(header) document.documentElement.style.setProperty('--header-h',header.offsetHeight+'px');
}
setHeaderHeight();
window.addEventListener('load',setHeaderHeight);
window.addEventListener('resize',setHeaderHeight);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(setHeaderHeight);

const burger=document.getElementById('burger');
const mainNav=document.getElementById('mainNav');
if(burger&&mainNav){
  burger.addEventListener('click',()=>mainNav.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));
}

function toggleFaq(btn){
  const item=btn.parentElement;
  const wasOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}

/* ===== BRANCH CAROUSEL: 7 CARDS, SMOOTH, INFINITE + CONTROLS ===== */
(function(){
  const track=document.getElementById('branchTrack');
  if(!track) return;
  const viewport=track.parentElement;

  const extras=[
    {name:'Maxim Mall',city:'New Cairo',image:'https://picsum.photos/seed/maximmall/400/300',map:'https://www.google.com/maps/search/?api=1&query=Maxim+Mall+New+Cairo'},
    {name:'Nasr City',city:'Cairo',image:'https://picsum.photos/seed/nasrcity/400/300',map:'https://www.google.com/maps/search/?api=1&query=Nasr+City+Cairo'}
  ];
  if(track.querySelectorAll('.branch-card').length<7){
    extras.forEach(branch=>{
      const card=document.createElement('a');
      card.className='branch-card';
      card.href=branch.map; card.target='_blank'; card.rel='noopener noreferrer';
      card.setAttribute('aria-label',`Open ${branch.name} in Google Maps`);
      card.innerHTML=`<div class="img-wrap"><img src="${branch.image}" alt="${branch.name} branch" loading="lazy"></div><div class="info"><h4>${branch.name}</h4><span>📍 ${branch.city}</span></div>`;
      track.appendChild(card);
    });
  }

  let controls=viewport.parentElement.querySelector('.branch-controls');
  if(!controls){
    controls=document.createElement('div');
    controls.className='branch-controls';
    controls.innerHTML=`
      <button class="branch-control branch-prev" type="button" aria-label="Previous branch"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
      <button class="branch-control branch-next" type="button" aria-label="Next branch"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>`;
    viewport.insertAdjacentElement('afterend',controls);
  }
  const prev=controls.querySelector('.branch-prev');
  const next=controls.querySelector('.branch-next');

  let paused=false, animating=false, timer=null;
  const interval=3600, duration=850;

  function stepSize(){
    const first=track.querySelector('.branch-card');
    if(!first) return 0;
    const gap=parseFloat(getComputedStyle(track).gap)||0;
    return first.getBoundingClientRect().width+gap;
  }

  function move(direction=1){
    if(animating||track.children.length<2) return;
    const step=stepSize();
    if(!step) return;
    animating=true;
    track.style.transition=`transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;

    if(direction===1){
      requestAnimationFrame(()=>track.style.transform=`translate3d(${-step}px,0,0)`);
      const done=e=>{
        if(e.target!==track||e.propertyName!=='transform') return;
        track.removeEventListener('transitionend',done);
        track.style.transition='none';
        track.appendChild(track.firstElementChild);
        track.style.transform='translate3d(0,0,0)';
        track.getBoundingClientRect();
        animating=false;
      };
      track.addEventListener('transitionend',done);
    }else{
      track.style.transition='none';
      track.insertBefore(track.lastElementChild,track.firstElementChild);
      track.style.transform=`translate3d(${-step}px,0,0)`;
      track.getBoundingClientRect();
      track.style.transition=`transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;
      requestAnimationFrame(()=>track.style.transform='translate3d(0,0,0)');
      const done=e=>{
        if(e.target!==track||e.propertyName!=='transform') return;
        track.removeEventListener('transitionend',done);
        track.style.transition='none';
        track.style.transform='translate3d(0,0,0)';
        animating=false;
      };
      track.addEventListener('transitionend',done);
    }
  }

  function restart(){ clearInterval(timer); timer=setInterval(()=>{if(!paused) move(1);},interval); }
  next.addEventListener('click',()=>{move(1);restart();});
  prev.addEventListener('click',()=>{move(-1);restart();});
  viewport.addEventListener('mouseenter',()=>paused=true);
  viewport.addEventListener('mouseleave',()=>paused=false);
  viewport.addEventListener('touchstart',()=>paused=true,{passive:true});
  viewport.addEventListener('touchend',()=>paused=false,{passive:true});
  viewport.addEventListener('touchcancel',()=>paused=false,{passive:true});
  window.addEventListener('resize',()=>{track.style.transition='none';track.style.transform='translate3d(0,0,0)';animating=false;});
  restart();
})();

/* ===== Scrollspy ===== */
(function(){
  const navLinks=Array.from(document.querySelectorAll('.main-nav a'));
  const sections=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    const headerH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))||86;
    const markerY=window.scrollY+headerH+(window.innerHeight-headerH)*.4;
    let currentIndex=0;
    sections.forEach((section,index)=>{if(markerY>=section.offsetTop) currentIndex=index;});
    navLinks.forEach(link=>link.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll); onScroll();
})();

/* ===== Gallery image preview box ===== */
(function(){
  const lightbox=document.getElementById('galleryLightbox');
  const previewBox=document.getElementById('galleryPreviewBox');
  const closeButton=document.getElementById('lightboxClose');
  const galleryItems=document.querySelectorAll('.gallery-item');
  if(!lightbox||!previewBox||!closeButton||!galleryItems.length) return;
  function openLightbox(image){previewBox.style.backgroundImage=`url("${(image.currentSrc||image.src).replace(/"/g,'\\"')}")`;lightbox.classList.add('open');document.body.classList.add('lightbox-open');}
  function closeLightbox(){lightbox.classList.remove('open');document.body.classList.remove('lightbox-open');setTimeout(()=>{if(!lightbox.classList.contains('open'))previewBox.style.backgroundImage='';},350);}
  galleryItems.forEach(item=>item.addEventListener('click',e=>{e.preventDefault();const image=item.querySelector('img');if(image)openLightbox(image);}));
  closeButton.addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox.classList.contains('open'))closeLightbox();});
})();

/* ===== GO TO TOP ===== */
(function(){
  const hero=document.getElementById('home'); if(!hero) return;
  let goTop=document.getElementById('goTop');
  if(!goTop){
    goTop=document.createElement('button');goTop.id='goTop';goTop.className='go-top';goTop.type='button';goTop.setAttribute('aria-label','Go to top');
    goTop.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    document.body.appendChild(goTop);
  }
  function update(){goTop.classList.toggle('show',hero.getBoundingClientRect().bottom<=0);}
  window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
  goTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
