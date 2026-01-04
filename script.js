// Simple JS for navigation toggle and contact form handling
document.addEventListener('DOMContentLoaded', function(){
  // Set current year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if(navToggle && navList){
    navToggle.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', (!expanded).toString());
      navList.classList.toggle('show');
    });
  }

  // Theme toggle (default: dark)
  const themeToggle = document.getElementById('theme-toggle');
  // Safe storage helpers: guard against environments where localStorage is unavailable
  function storageGet(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } }
  function storageSet(key, value){ try{ localStorage.setItem(key, value); }catch(e){ /* noop */ } }
  const storedTheme = storageGet('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'dark'); // default to dark
  const applyTheme = (t, opts = {}) => {
    document.documentElement.setAttribute('data-theme', t);
    if(themeToggle){
      themeToggle.setAttribute('aria-pressed', (t === 'light').toString());
      if(opts.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        themeToggle.classList.add('is-anim');
        setTimeout(()=> themeToggle.classList.remove('is-anim'), 700);
      }
    }
  };
  applyTheme(initialTheme, {animate:false});

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next, {animate:true});
      storageSet('theme', next);
    });
  }

  /* Parallax background for hero and scroll hint behavior */
  const hero = document.querySelector('.hero');
  const scrollHint = document.getElementById('scroll-hint');
  let ticking = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax(){
    if(!hero || reducedMotion) return;
    const scrolled = window.scrollY || window.pageYOffset;
    const offset = Math.round(scrolled * 0.25); // slow move
    hero.style.setProperty('--hero-offset', (offset * -1) + 'px');
  }

  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(()=>{ updateParallax(); ticking = false; });
      ticking = true;
    }
    // hide hint when user scrolls down
    if(scrollHint && window.scrollY > 30){ scrollHint.classList.add('hidden'); }
  }

  if(!reducedMotion){ window.addEventListener('scroll', onScroll, {passive:true}); }

  // Click on hint scrolls to projects
  if(scrollHint){
    scrollHint.addEventListener('click', ()=>{
      document.querySelector('#projects').scrollIntoView({behavior:'smooth'});
      scrollHint.classList.add('hidden');
    });
  }

  /* Modal (project detail) handling */
  const openModalButtons = document.querySelectorAll('.btn-open-modal');
  const mainContent = document.querySelector('main');
  let lastFocused = null;

  function openModal(id, trigger){
    const modal = document.getElementById(id);
    if(!modal) return;
    lastFocused = trigger || document.activeElement;
    modal.removeAttribute('hidden');
    modal.querySelector('.modal-close')?.focus();
    document.body.style.overflow = 'hidden';
    if(mainContent) mainContent.setAttribute('aria-hidden','true');
  }

  function closeModal(modal){
    if(!modal) return;
    modal.setAttribute('hidden','');
    document.body.style.overflow = '';
    if(mainContent) mainContent.removeAttribute('aria-hidden');
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  openModalButtons.forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = btn.getAttribute('data-modal');
      openModal(id, btn);
      // populate playful sample data for dashboard modal
      if(id === 'modal-dashboard'){
        const modal = document.getElementById(id);
        populateDashboardSample(modal);
      }
      if(id === 'modal-barista'){
        const modal = document.getElementById(id);
        populateBaristaSample(modal);
      }
    });
  });

  function populateDashboardSample(modal){
    if(!modal) return;
    // randomized but plausible samples
    const recs = 100 + Math.floor(Math.random()*60);
    const acc = 78 + Math.floor(Math.random()*17); // 78-94%
    const news = 1 + Math.floor(Math.random()*5);
    // sample keys so coffee names can be localized from the translations map
    const coffeeKeys = ['coffee.ethiopia','coffee.colombia','coffee.indonesia','coffee.kenya'];
    const coffeeFallback = ['Ethiopia Natural','Colombia Supremo','Indonesia Mandheling','Kenya AA'];
    const idx = Math.floor(Math.random()*coffeeKeys.length);
    const recCoffeeKey = coffeeKeys[idx];
    const recCoffeeFallback = coffeeFallback[idx];
    const sim = 80 + Math.floor(Math.random()*12);

    modal.querySelector('.metric-recs') && (modal.querySelector('.metric-recs').textContent = recs);
    modal.querySelector('.metric-acc') && (modal.querySelector('.metric-acc').textContent = acc + '%');
    modal.querySelector('.metric-new') && (modal.querySelector('.metric-new').textContent = news + '개');

    // update every rec-example on the page (card and modal) with localized coffee names
    const recEls = document.querySelectorAll('.rec-example');
    if(recEls && recEls.length){
      const lang = document.documentElement.lang || 'en';
      const map = translations[lang] || translations.en;
      const recCoffee = map[recCoffeeKey] || recCoffeeFallback;
      const tpl = map['dashboard.pred.rec_template'] || '"Recommended: {coffee} (similarity {sim}%) — {explain}"';
      const explain = map['dashboard.pred.rec_explain'] || 'flavor profile considered';
      recEls.forEach(el => {
        el.textContent = tpl.replace('{coffee}', recCoffee).replace('{sim}', sim).replace('{explain}', explain);
      });
    }
  }

  // Close handlers
  document.addEventListener('click',(e)=>{
    const target = e.target;
    if(target.matches('.modal-close') || target.closest('.modal-overlay')){
      const modal = target.closest('.modal');
      if(modal) closeModal(modal);
    }

    // how-it-works toggle
    if(target.matches('.how-toggle')){
      const expanded = target.getAttribute('aria-expanded') === 'true';
      const content = document.getElementById(target.getAttribute('aria-controls'));
      if(content){
        if(expanded){ content.setAttribute('hidden',''); target.setAttribute('aria-expanded','false'); }
        else{ content.removeAttribute('hidden'); target.setAttribute('aria-expanded','true'); }
      }
    }
  });

  document.addEventListener('keydown',(e)=>{
    if(e.key === 'Escape'){
      const open = document.querySelector('.modal:not([hidden])');
      if(open) closeModal(open);
    }
  });

  // Trigger scroll-to-next-section on wheel or touch swipe when at top
  let touchStartY = null;
  function triggerScrollToNext(){
    if(window.scrollY < 50){
      document.querySelector('#projects').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
      if(scrollHint) scrollHint.classList.add('hidden');
      // remove listeners after first trigger
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
    }
  }
  function onWheel(e){ if(e.deltaY > 10) triggerScrollToNext(); }
  function onTouchMove(e){ if(touchStartY !== null){ const dy = touchStartY - e.touches[0].clientY; if(dy > 30) triggerScrollToNext(); }}
  function onTouchStart(e){ touchStartY = e.touches[0].clientY; }

  window.addEventListener('wheel', onWheel, {passive:true});
  window.addEventListener('touchstart', onTouchStart, {passive:true});
  window.addEventListener('touchmove', onTouchMove, {passive:true});

  // populate barista sample function
  function populateBaristaSample(modal){
    if(!modal) return;
    // keep example values but also attach listeners to the form
    const form = modal.querySelector('#barista-form');
    const grindVal = modal.querySelector('#grind-val');
    if(form && !form._initialized){
      form._initialized = true;
      // slider live update
      const grind = form.querySelector('#grind');
      if(grind && grindVal){
        grind.addEventListener('input', ()=>{ grindVal.textContent = grind.value; });
      }

      // reset button
      const resetBtn = modal.querySelector('#barista-reset');
      if(resetBtn){ resetBtn.addEventListener('click', ()=>{ form.reset(); grindVal.textContent = form.querySelector('#grind').value; }); }

      // submit handler (delegated so we don't duplicate)
    }
    // initialize sample result placeholder
    const diagEl = modal.querySelector('.sample-diagnosis');
    const recEl = modal.querySelector('.sample-recommend');
    const lang = document.documentElement.lang || 'en';
    const map = translations[lang] || translations.en;
    if(diagEl) diagEl.textContent = map['barista.sample_prompt'] || 'Enter values and click [Analyze]';
    if(recEl) recEl.textContent = map['barista.sample_recommend'] || '';

    // attach form submit via event delegation higher up if not already attached
    if(!document._baristaFormAttached){
      document.addEventListener('submit', (e)=>{
        if(e.target && e.target.id === 'barista-form'){
          e.preventDefault();
          const formEl = e.target;
          const modalEl = formEl.closest('.modal');
          runBaristaAnalysis(modalEl, new FormData(formEl));
        }
      });
      document._baristaFormAttached = true;
    }
  }

  function runBaristaAnalysis(modal, formData){
    if(!modal) return;
    const grind = Number(formData.get('grind'));
    const time = Number(formData.get('time'));
    const dose = Number(formData.get('dose'));
    const yieldVal = Number(formData.get('yield'));
    const tastes = formData.getAll('taste');
    // simple heuristic — just for demo
    const targetTime = 28;
    const timeDiff = time - targetTime;
    let diagnosis = 'Balance';
    let recommend = 'Maintain current settings';
    if(timeDiff > 4){ diagnosis = 'Over-extraction'; recommend = 'Coarsen grind or reduce time by ~5s.'; }
    if(timeDiff < -4){ diagnosis = 'Under-extraction'; recommend = 'Finer grind or extend time by ~5s.'; }
    const gauge = Math.max(50, Math.min(95, 100 - Math.abs(timeDiff)*2));

    const diagEl = modal.querySelector('.sample-diagnosis');
    const recEl = modal.querySelector('.sample-recommend');
    const gaugeEl = modal.querySelector('.gauge-value');
    const timeFill = modal.querySelector('.time-bar-fill');
    const marker = modal.querySelector('.time-marker');

    if(diagEl) diagEl.textContent = diagnosis;
    if(recEl) recEl.textContent = recommend;
    if(gaugeEl) gaugeEl.textContent = gauge + '%';
    if(timeFill) timeFill.style.width = Math.max(8,Math.min(100,(time/60*100))) + '%';
    if(marker) marker.style.left = Math.max(6,Math.min(94,(time/60*100))) + '%';

    // show result area
    const result = modal.querySelector('#barista-result');
    if(result){
      result.removeAttribute('hidden');
      setTimeout(()=>{
        result.querySelector('.spinner') && (result.querySelector('.spinner').style.display = 'none');
        result.querySelector('.result-inner') && (result.querySelector('.result-inner').removeAttribute('hidden'));
      }, 700);
    }
  }

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = new FormData(contactForm);
      const payload = {};
      for(const [k,v] of data.entries()){ payload[k]=v; }
      // simple validation
      if(!payload.name || payload.name.length < 2){ document.getElementById('form-feedback').textContent = '이름을 확인해주세요'; return; }
      if(!payload.email || payload.email.indexOf('@')===-1){ document.getElementById('form-feedback').textContent = '이메일을 확인해주세요'; return; }
      document.getElementById('form-feedback').textContent = '메시지를 전송했습니다 — 감사합니다!';
      contactForm.reset();
    });
  }

  // Basic i18n skeleton (translations added inline)
  const translations = {
    'en':{
      'nav.projects':'Projects','nav.about':'About','nav.contact':'Contact','nav.logo_text':'Portfolio','nav.theme_toggle':'Toggle theme','nav.theme_toggle_aria':'Toggle site theme','nav.lang_aria':'Language switcher',
      'hero.cta_projects':'View projects','hero.cta_contact':'Contact',
      'detail_btn':'Details',
      'card1.title':'AI Coffee Curation','card1.desc':'A learning dashboard providing recommendations based on user tastes.',
      'card2.title':'Cafe Operations AI Assistant','card2.desc':'Practical AI assistant that analyzes sales, inventory, and menu strategies.','card2.img_alt':'Coffee beans image','card1.img_alt':'Latte art image','card3.img_alt':'Espresso extraction image','modal.dashboard.img_alt':'Latte art','modal.barista.img_alt':'Espresso extraction','modal.close':'Close','modal.dashboard.tag.reco':'Recommendations','modal.dashboard.tag.ai':'AI / ML','modal.dashboard.tag.viz':'Data visualization','modal.barista.tag.training':'Training AI','modal.barista.tag.feedback':'Practice feedback','modal.barista.tag.data':'Data-driven','modal.dashboard.tech_title':'Technical approach (Tech)',
      'dashboard.predictions_title':'Examples & Suggestions','dashboard.pred.today_title':'Today\'s Recommendation','dashboard.pred.today_body':'"Recommended: Ethiopia Natural (similarity 87%) — bright, fruity profile"','dashboard.pred.try_title':'Suggested Experiment','dashboard.pred.try_body':'Try a new blend test → campaign if response is positive','dashboard.pred.rec_template':'"Recommended: {coffee} (similarity {sim}%) — {explain}"','dashboard.pred.rec_explain':'Flavor profile considered','coffee.ethiopia':'Ethiopia Natural','coffee.colombia':'Colombia Supremo','coffee.indonesia':'Indonesia Mandheling','coffee.kenya':'Kenya AA','dashboard.ai_quote':'"You prefer bright, fruity coffees — today we recommend Ethiopia Natural."',
      'barista.diagnosis_title':'Diagnosis examples','barista.diagnosis.over':'Over-extraction','barista.diagnosis.over_desc':'Long extraction time and bitter taste','barista.diagnosis.over_explain':'Coarsen grind by 1 step or reduce extraction time by 5s','barista.elevator.title':'One-liner','barista.elevator.body':'Input practice data and the AI will analyze extraction issues and suggest improvements.',
      'contact.title':'Contact','contact.sub':'Reach out for project inquiries or collaborations.','contact.name_label':'Name','contact.email_label':'Email','contact.message_label':'Message','contact.send_btn':'Send','contact.name_placeholder':'Your name','contact.email_placeholder':'you@example.com','contact.message_placeholder':'Write your message here'
    },
    'ko':{
      'nav.projects':'프로젝트','nav.about':'소개','nav.contact':'연락처','nav.logo_text':'포트폴리오','nav.theme_toggle':'테마 전환','nav.theme_toggle_aria':'테마 변경','nav.lang_aria':'언어 선택',
      'hero.cta_projects':'프로젝트 보기','hero.cta_contact':'연락하기','detail_btn':'자세히',
      'card1.title':'AI 커피 큐레이션','card1.desc':'사용자 취향 기반 추천을 제공하는 학습형 커피 큐레이션 대시보드',
      'card2.title':'카페 운영 AI 어시스턴트','card2.desc':'카페 판매 데이터를 분석해 매출·재고·메뉴 전략을 지원하는 실무형 AI 어시스턴트','card2.img_alt':'커피 원두 이미지','card1.img_alt':'라떼 아트 이미지','card3.img_alt':'에스프레소 추출 이미지','modal.dashboard.img_alt':'라떼 아트','modal.barista.img_alt':'에스프레소 추출','modal.close':'닫기','modal.dashboard.tag.reco':'추천 시스템','modal.dashboard.tag.ai':'AI / ML','modal.dashboard.tag.viz':'데이터 시각화','modal.barista.tag.training':'교육용 AI','modal.barista.tag.feedback':'실습 피드백','modal.barista.tag.data':'데이터 기반','modal.dashboard.tech_title':'기술적 접근 (Tech)',
      'dashboard.predictions_title':'추천 예시 & 제안','dashboard.pred.today_title':'오늘의 추천','dashboard.pred.today_body':'"당신에게 추천: 에티오피아 내추럴 (유사도 87%) — 산미·베리향 선호 반영"','dashboard.pred.try_title':'시도 권장','dashboard.pred.try_body':'신규 블렌드 테스트 → 추천 반응이 좋을 시 캠페인 전개','dashboard.pred.rec_template':'"당신에게 추천: {coffee} (유사도 {sim}%) — {explain}"','dashboard.pred.rec_explain':'향미 프로파일 반영','coffee.ethiopia':'에티오피아 내추럴','coffee.colombia':'콜롬비아 수프리모','coffee.indonesia':'인도네시아 만델링','coffee.kenya':'케냐 AA','dashboard.ai_quote':'"당신은 밝고 과일향의 커피를 선호합니다 — 오늘은 에티오피아 내추럴을 추천합니다."',
      'barista.diagnosis_title':'진단 예시','barista.diagnosis.over':'과다 추출','barista.diagnosis.over_desc':'추출 시간이 길고 쓴맛이 강함','barista.diagnosis.over_explain':'분쇄도를 1단계 굵게 또는 추출 시간 5초 단축','barista.elevator.title':'한 줄 설명','barista.elevator.body':'실습 데이터를 입력하면 AI가 추출의 문제를 분석하고, 개선안을 제안합니다.',
      'contact.title':'Contact','contact.sub':'프로젝트 관련 문의나 협업 제안은 아래 양식을 이용해주세요.','contact.name_label':'이름','contact.email_label':'이메일','contact.message_label':'메시지','contact.send_btn':'보내기','contact.name_placeholder':'홍길동','contact.email_placeholder':'you@example.com','contact.message_placeholder':'문의 내용을 입력하세요'
    }
  };

  // Minimal language switcher
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  function setLanguage(lang){
    if(!lang) return;
    document.documentElement.lang = lang;
    const map = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(map[key]) el.textContent = map[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      if(map[key]) el.placeholder = map[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const key = el.getAttribute('data-i18n-aria');
      if(map[key]) el.setAttribute('aria-label', map[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el=>{
      const key = el.getAttribute('data-i18n-alt');
      if(map[key]) el.setAttribute('alt', map[key]);
    });

    // update rec examples to localized coffee names
    document.querySelectorAll('.rec-example').forEach(el=>{
      const tpl = map['dashboard.pred.rec_template'] || '"Recommended: {coffee} (similarity {sim}%) — {explain}"';
      const coffee = map['coffee.ethiopia'] || 'Ethiopia Natural';
      el.textContent = tpl.replace('{coffee}', coffee).replace('{sim}', '87').replace('{explain}', map['dashboard.pred.rec_explain'] || 'Flavor profile considered');
    });

    storageSet('site_lang', lang);
  }

  // Initial language from storage
  const saved = storageGet('site_lang') || 'ko';
  setLanguage(saved);

});