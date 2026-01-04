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
  const storedTheme = localStorage.getItem('theme');
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
      localStorage.setItem('theme', next);
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

    const resultBox = modal.querySelector('#barista-result');
    const spinner = resultBox.querySelector('.spinner');
    const inner = resultBox.querySelector('.result-inner');
    const diagEl = resultBox.querySelector('.sample-diagnosis');
    const recEl = resultBox.querySelector('.sample-recommend');
    resultBox.removeAttribute('hidden');
    inner.setAttribute('hidden','');

    // show spinner for a moment to simulate analysis
    setTimeout(()=>{
      // rule-based diagnosis using i18n keys
      let diagKey = null;
      let recKey = null;
      if(time >= 30 && tastes.includes('bitter')){
        diagKey = 'barista.diagnosis.over'; recKey = 'barista.diagnosis.over_explain';
      } else if(time <= 18 && tastes.includes('sour')){
        diagKey = 'barista.diagnosis.under'; recKey = 'barista.diagnosis.under_explain';
      } else if(tastes.includes('bland') || Math.abs(dose - 18) > 3){
        diagKey = 'barista.diagnosis.balance'; recKey = 'barista.diagnosis.balance_explain';
      } else {
        diagKey = 'barista.result.ok'; recKey = 'barista.result.ok_explain';
      }

      const lang = document.documentElement.lang || 'en';
      const map = translations[lang] || translations.en;
      const diagnosisText = map[diagKey] || '';
      const recommendText = (map['barista.result.recommend_prefix'] ? map['barista.result.recommend_prefix'] + ' ' : '') + (map[recKey] || '');

      // update DOM
      if(diagEl) diagEl.textContent = diagnosisText;
      if(recEl) recEl.textContent = recommendText;

      // compute simple confidence score (example heuristic)
      const confidence = Math.max(50, Math.min(98, 100 - Math.abs(time - 26) - Math.abs(dose - 18)));

      // render time bar (0-60s scale), marker at time
      const fillPercent = Math.max(4, Math.min(96, (Math.min(time,60)/60)*100));
      const markerPercent = Math.max(0, Math.min(100, (time/60)*100));
      const timeBarFill = resultBox.querySelector('.time-bar-fill');
      const timeMarker = resultBox.querySelector('.time-marker');
      const timeValue = resultBox.querySelector('.time-value');
      if(timeBarFill) timeBarFill.style.width = fillPercent + '%';
      if(timeMarker) timeMarker.style.left = markerPercent + '%';
      if(timeValue) timeValue.textContent = time;

      // render gauge (stroke-dasharray based on 94 circumference) - circle r=15 => circumference ~ 94.2
      const gaugeFill = resultBox.querySelector('.gauge-fill');
      const gaugeVal = resultBox.querySelector('.gauge-value');
      const circumference = 94;
      const dash = (confidence/100)*circumference;
      if(gaugeFill) gaugeFill.setAttribute('stroke-dasharray', dash + ' ' + (circumference-dash));
      if(gaugeVal) gaugeVal.textContent = Math.round(confidence) + '%';

      inner.removeAttribute('hidden');

      // save to session history (in memory)
      document._baristaHistory = document._baristaHistory || [];
      document._baristaHistory.unshift({time, dose, grind, score: Math.round(confidence)});

      const sessionsEl = modal.querySelector('#barista-sessions');
      const timestamp = new Date().toLocaleTimeString();
      const li = document.createElement('li');
      li.textContent = `${timestamp} · ${diagnosis} · ${recommend}`;
      if(sessionsEl){ sessionsEl.prepend(li); if(sessionsEl.children.length>5) sessionsEl.removeChild(sessionsEl.lastChild); }

      // render sparkline from history
      const spark = resultBox.querySelector('.sparkline');
      if(spark && document._baristaHistory.length){
        const values = document._baristaHistory.slice(0,10).map(s=>s.score).reverse();
        const max = Math.max(...values, 100);
        const min = Math.min(...values, 0);
        const pts = values.map((v,i)=>{
          const x = (i/(values.length-1||1))*100;
          const y = 30 - ((v-min)/(max-min||1))*26;
          return `${x},${y}`;
        }).join(' ');
        // clear
        spark.innerHTML = '';
        const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
        poly.setAttribute('points', pts);
        poly.setAttribute('fill','none');
        poly.setAttribute('stroke','var(--accent-2)');
        poly.setAttribute('stroke-width','2');
        spark.appendChild(poly);
        // last point marker
        const last = values[values.length-1];
        const lx = values.length>0?100:0;
        const ly = values.length>0?30 - ((last-min)/(max-min||1))*26:15;
        const circ = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circ.setAttribute('cx', lx);
        circ.setAttribute('cy', ly);
        circ.setAttribute('r','2.5');
        circ.setAttribute('fill','var(--accent)');
        spark.appendChild(circ);
      }

      // graceful reveal animation
      inner.classList.add('reveal');
      setTimeout(()=>inner.classList.remove('reveal'), 600);
    }, 700);
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href.length>1){
        e.preventDefault();
        document.querySelector(href).scrollIntoView({behavior:'smooth', block:'start'});
        // close nav on small screens
        if(navList.classList.contains('show')){
          navList.classList.remove('show');
          if(navToggle) navToggle.setAttribute('aria-expanded','false');
        }
      }
    })
  });

  // Contact form validation/submit (fake)
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      const lang = document.documentElement.lang || 'en';
      const map = translations[lang] || translations.en;

      if(name.length<2){
        feedback.textContent = map['form.name_error'] || 'Please enter a name (at least 2 characters).'; feedback.style.color='var(--accent)'; return;
      }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
        feedback.textContent = map['form.email_error'] || 'Please enter a valid email address.'; feedback.style.color='var(--accent)'; return;
      }
      if(message.length<10){
        feedback.textContent = map['form.message_error'] || 'Please enter a message (at least 10 characters).'; feedback.style.color='var(--accent)'; return;
      }

      // Simulate sending
      feedback.style.color='var(--accent-2)';
      feedback.textContent = map['form.sending'] || 'Sending...';
      setTimeout(()=>{
        feedback.textContent = map['form.sent'] || 'Message sent successfully. Thank you!';
        form.reset();
      },900);
    });
  }

  /* --- i18n: language switching (EN/JA/KO) --- */
  const translations = {
    en: {}, ja: {}, ko: {}
  };
  // Populate translations for keys used in data-i18n and data-i18n-placeholder
  Object.assign(translations.en, {
    'meta.title':'Donguk Lee — Portfolio','meta.description':'A modern, responsive personal portfolio focused on coffee projects and frontend work.',
    'nav.logo_aria':'Go to home','nav.logo_text':'Portfolio','nav.lang_aria':'Language selector','nav.theme_toggle_aria':'Toggle theme (dark/light)','nav.theme_toggle':'Theme switch',
    'nav.projects':'Projects','nav.about':'About','nav.contact':'Contact',
    'hero.cta_projects':'View Projects','hero.cta_contact':'Contact',
    'projects.title':'Selected Projects','projects.sub':'Here are brief project summaries and links.',
    'card1.title':'AI Coffee Curation','card1.desc':'A learning dashboard providing recommendations based on user tastes.',
    'card2.title':'Cafe Operations AI Assistant','card2.desc':'Practical AI assistant that analyzes sales, inventory, and menu strategies.','card2.img_alt':'Coffee beans image','card1.img_alt':'Latte art image','card3.img_alt':'Espresso extraction image','modal.dashboard.img_alt':'Latte art','modal.barista.img_alt':'Espresso extraction','modal.close':'Close','modal.dashboard.tag.reco':'Recommendations','modal.dashboard.tag.ai':'AI / ML','modal.dashboard.tag.viz':'Data visualization','modal.barista.tag.training':'Training AI','modal.barista.tag.feedback':'Practice feedback','modal.barista.tag.data':'Data-driven','modal.dashboard.tech_title':'Technical approach (Tech)',
    'card3.title':'AI Barista Trainer','card3.desc':'An educational AI that diagnoses extraction issues from practice data and suggests improvements.',
    'detail_btn':'Details',
    'modal.dashboard.title':'AI Coffee Curation — Dashboard','modal.dashboard.sub':'Provides recommendations based on user preferences.','modal.dashboard.tech_desc':'Data normalization, preference vectorization, and hybrid recommendation models ensure accuracy and explainability.','modal.dashboard.impact_title':'Impact','modal.dashboard.impact_body':'Users can discover coffees matching their tastes, and roasters can improve revenue through personalized experiences.',
    'modal.barista.title':'AI Barista Trainer','modal.barista.sub':'Input practice data to diagnose extraction issues and receive tailored improvement advice.',
    'modal.cafe.title':'Cafe Operations AI Assistant','modal.cafe.sub':'Analyzes sales, inventory and suggests menu strategies.',

    'dashboard.metric.recs_label':'Today\'s recommendations','dashboard.metric.recs_sub':'Recent change','dashboard.metric.recs_explain':'This number changes based on real-time interactions (clicks, ratings).','dashboard.metrics_aria':'Key metrics',
    'dashboard.metric.acc_label':'Recommendation accuracy','dashboard.metric.acc_sub':'Avg satisfaction','dashboard.metric.acc_explain':'Track accuracy via post-recommendation ratings and repeat purchases.',
    'dashboard.metric.new_label':'New recommendations','dashboard.metric.new_sub':'This week','dashboard.metric.new_explain':'Number of newly discovered recommendations per user.',
    'dashboard.alerts_title':'Quick Alerts','dashboard.alert.trend':'Trend','dashboard.alert.trend_text':'Interest in natural-profile coffees rising','dashboard.alert.reaction':'Reaction','dashboard.alert.reaction_text':'Average rating of recommended coffees: 4.6/5','dashboard.alert.repeat':'Repeat recommendations','dashboard.alert.repeat_text':'Repeat purchase frequency +11% over last 7 days',
    'dashboard.predictions_title':'Examples & Suggestions','dashboard.pred.today_title':'Today\'s Recommendation','dashboard.pred.today_body':'"Recommended: Ethiopia Natural (similarity 87%) — bright, fruity profile"','dashboard.pred.try_title':'Suggested Experiment','dashboard.pred.try_body':'Try a new blend test → campaign if response is positive','dashboard.pred.rec_template':'"Recommended: {coffee} (similarity {sim}%) — {explain}"','dashboard.pred.rec_explain':'Flavor profile considered','coffee.ethiopia':'Ethiopia Natural','coffee.colombia':'Colombia Supremo','coffee.indonesia':'Indonesia Mandheling','coffee.kenya':'Kenya AA','dashboard.ai_quote':'"You prefer bright, fruity coffees — today we recommend Ethiopia Natural."',
    'how.toggle':'How it works ▾','how.step1':'Data collection: ratings, clicks, repeat purchases','how.step2':'Feature engineering: roast, origin, flavor converted to standard features','how.step3':'Recommendation: hybrid model (collaborative + content-based)','how.step4':'Explanation: visualize feature contributions for recommendations','dashboard.method.similarity':'(Method: similarity-based filtering + content explain)','dashboard.method.clustering':'(Method: clustering and conversion rate analysis)','barista.time_actual':'Actual:','barista.time_ideal':'Ideal: 24–30s',

    'barista.diagnosis_title':'Diagnosis examples','barista.diagnosis.over':'Over-extraction','barista.diagnosis.over_desc':'Long extraction time and bitter taste','barista.diagnosis.over_explain':'Coarsen grind by 1 step or reduce extraction time by 5s','barista.elevator.title':'One-liner','barista.elevator.body':'Input practice data and the AI will analyze extraction issues and suggest improvements.',
    'barista.diagnosis.under':'Under-extraction','barista.diagnosis.under_desc':'Short time and sour taste','barista.diagnosis.under_explain':'Make grind 1 step finer or extend extraction time 5s',
    'barista.diagnosis.balance':'Balance issue','barista.diagnosis.balance_desc':'Flat taste','barista.diagnosis.balance_explain':'Fine-tune dosing and check brew ratio',
    'barista.input_title':'Try inputting practice values','barista.label.grind':'Grind','barista.label.grind_hint':'(1=Fine · 10=Coarse)','barista.label.time':'Extraction time (s)','barista.label.dose':'Dose (g)','barista.label.yield':'Yield (ml)',
    'barista.label.taste':'Taste notes','barista.taste.bitter':'Bitter','barista.taste.sour':'Sour','barista.taste.bland':'Bland',
    'barista.btn.analyze':'Analyze','barista.btn.reset':'Reset','barista.result.title':'Diagnosis','barista.result.recommend_prefix':'Recommendation:','barista.result.ok':'Good extraction (within spec)','barista.result.ok_explain':'Settings are stable. Fine-tune for preference.','barista.sample_prompt':'Enter values and click [Analyze]','barista.sample_recommend':'',
    'barista.chart.time_label':'Extraction time','barista.chart.conf_label':'Confidence','barista.chart.sparkline_label':'Recent scores','barista.compare_note':'(Improvement points compared to previous sessions will be shown here)','barista.session_title':'Recent practice sessions',

    'cafe.alerts_title':'Real-time Alerts','cafe.alert.stock':'Stock alert','cafe.alert.stock_text':'Espresso beans — low in ~48 hours','cafe.alert.surge':'Sales surge','cafe.alert.surge_text':'Americano sales +34% at 12–13 today','cafe.alert.weather':'Forecast','cafe.alert.weather_text':'Rain forecast tomorrow — hot drinks demand +18%','cafe.alert.stock_explain':'Automatically generated based on current consumption and restock cadence','cafe.alert.surge_explain':'Compared to the same weekday/hour historically','cafe.alert.weather_explain':'Linked to weather forecast and historical sales patterns','cafe.predictions_title':'Predictions & Suggestions','cafe.pred.menu':'Menu prediction','cafe.pred.staff':'Staff suggestion','cafe.pred.promo':'Promotion ideas','cafe.method.ts':'(Method: time-series model + external variable adjustment)','cafe.method.staff':'(Method: historical peak correlation analysis)','cafe.method.promo':'(Method: low-sales detection and A/B ideas)','cafe.ai_quote':'"We expect iced drink demand to drop after 6 PM — consider a dessert promotion."','cafe.metric.sales_label':'Today\'s forecasted sales','cafe.metric.sales_sub_label':'Prediction confidence','cafe.metric.sales_explain':'Forecast calculated from last 30 days sales, inventory, and bookings/events','cafe.metric.top3_label':'Top 3','cafe.top.item1':'Iced Latte','cafe.top.item2':'Americano','cafe.top.item3':'Vanilla Frappuccino','cafe.metric.top3_sub':'Reflects real-time sales','cafe.metric.top3_explain':'Top menus combine last 7 days trend and real-time orders','cafe.metric.stock_label':'Stock alert','cafe.metric.stock_value':'Espresso beans — low in 2 days','cafe.metric.stock_sub':'Order recommended','cafe.metric.stock_explain':'Estimates depletion days based on current consumption rate','cafe.pred.menu_body':'Rain forecast tomorrow — hot drinks demand +18%.','cafe.pred.menu_suggest':'Suggestion:','cafe.pred.menu_action':'Hot drinks promotion','cafe.pred.staff_body':'Expected peak: Weekday 12–14 → add 1 barista','cafe.pred.promo_body':'Low dessert sales in evening → dessert+drink set discount suggested','cafe.metrics_aria':'Key metrics','cafe.tag.practical':'Practical AI','cafe.tag.data':'Data analytics','cafe.tag.predict':'Prediction & Alerts','modal.cafe.img_alt':'Cafe AI assistant screenshot',

    'contact.title':'Contact','contact.sub':'For project inquiries or collaboration proposals, use the form below.',
    'contact.name_label':'Name','contact.name_placeholder':'Donguk Lee','contact.email_label':'Email','contact.email_placeholder':'you@example.com',
    'contact.message_label':'Message','contact.message_placeholder':'Write your message here','contact.send_btn':'Send',

    'meta.title':'Donguk Lee — Portfolio','meta.description':'A modern, responsive personal portfolio focused on coffee projects and frontend work.',
    'footer.name':'Donguk Lee','footer.rights':'All rights reserved.','social.github':'GitHub','social.email':'Email','social.github_aria':'View GitHub','social.email_aria':'Send email',
    'form.name_error':'Please enter a name (at least 2 characters).','form.email_error':'Please enter a valid email address.','form.message_error':'Please enter a message (at least 10 characters).','form.sending':'Sending...','form.sent':'Message sent successfully. Thank you!',
    'dashboard.pred.rec_template':'"Recommended: {coffee} (similarity {sim}%) — {explain}"'
  });
  Object.assign(translations.ja, {
    'meta.title':'Donguk Lee — ポートフォリオ','meta.description':'コーヒープロジェクトとフロントエンド作品に焦点を当てたモダンで反応的な個人ポートフォリオです。',
    'nav.logo_aria':'ホームに戻る','nav.logo_text':'ポートフォリオ','nav.lang_aria':'言語選択','nav.theme_toggle_aria':'テーマ切替 (ダーク/ライト)','nav.theme_toggle':'テーマ切替',
    'nav.projects':'プロジェクト','nav.about':'紹介','nav.contact':'お問い合わせ',
    'hero.cta_projects':'プロジェクトを見る','hero.cta_contact':'お問い合わせ',
    'projects.title':'選択されたプロジェクト','projects.sub':'プロジェクトの簡単な紹介とリンクを確認できます。',
    'card1.title':'AI コーヒーキュレーション','card1.desc':'ユーザーの好みに基づく推薦を提供する学習型コーヒーダッシュボード',
    'card2.title':'カフェ運営AIアシスタント','card2.desc':'売上・在庫・メニュー戦略を支援する実務的なAIアシスタント','card2.img_alt':'コーヒー豆画像','card1.img_alt':'ラテアート画像','card3.img_alt':'エスプレッソ抽出画像','modal.dashboard.img_alt':'ラテアート','modal.barista.img_alt':'エスプレッソ抽出','modal.close':'閉じる','modal.dashboard.tag.reco':'おすすめ','modal.dashboard.tag.ai':'AI / ML','modal.dashboard.tag.viz':'データ可視化','modal.barista.tag.training':'トレーニングAI','modal.barista.tag.feedback':'実習フィードバック','modal.barista.tag.data':'データ駆動','modal.dashboard.tech_title':'技術的アプローチ (Tech)',
    'card3.title':'AI バリスタ トレーナー','card3.desc':'実習データから抽出の問題を診断し改善案を提案する教育用AI',
    'detail_btn':'詳細',
    'modal.dashboard.title':'AI コーヒーキュレーション — ダッシュボード','modal.dashboard.sub':'ユーザーの嗜好に基づく推薦を提供します。','modal.dashboard.tech_desc':'データ正規化、嗜好のベクトル化、ハイブリッド推薦モデルで精度と説明性を確保します。','modal.dashboard.impact_title':'インパクト','modal.dashboard.impact_body':'ユーザーは自分の嗜好に合ったコーヒーを簡単に発見でき、ロースターはパーソナライズされた体験で売上を改善できます。',
    'modal.barista.title':'AI バリスタ トレーナー','modal.barista.sub':'実習データを入力して抽出の問題を診断し、改善提案を受け取ります。',
    'modal.cafe.title':'カフェ運営AIアシスタント','modal.cafe.sub':'売上・在庫を分析し、メニュー戦略を提案します。',

    'dashboard.metric.recs_label':'今日のおすすめ数','dashboard.metric.recs_sub':'最近の変化','dashboard.metric.recs_explain':'この数値はリアルタイムの行動（クリック・評価）により変動します。',
    'dashboard.metric.acc_label':'推薦精度','dashboard.metric.acc_sub':'平均満足度','dashboard.metric.acc_explain':'推薦後の評価や再購入で精度を追跡します。',
    'dashboard.metric.new_label':'新しいおすすめ','dashboard.metric.new_sub':'今週','dashboard.metric.new_explain':'ユーザーごとに新たに発見されたおすすめの数です。',
    'dashboard.alerts_title':'クイックアラート','dashboard.alert.trend':'トレンド','dashboard.alert.trend_text':'ナチュラルプロファイルの関心が増加','dashboard.alert.reaction':'反応','dashboard.alert.reaction_text':'推薦されたコーヒーの平均評価: 4.6/5','dashboard.alert.repeat':'再推薦増加','dashboard.alert.repeat_text':'過去7日間の再購入頻度 +11%',
    'dashboard.predictions_title':'推薦例と提案','dashboard.pred.today_title':'今日のおすすめ','dashboard.pred.today_body':'「おすすめ: エチオピア ナチュラル（類似度 87%） — 明るくフルーティーなプロファイル」','dashboard.pred.try_title':'試してみる提案','dashboard.pred.try_body':'新しいブレンドテスト → 反応が良ければキャンペーン展開','dashboard.pred.rec_template':'「おすすめ: {coffee}（類似度 {sim}%） — {explain}」','dashboard.pred.rec_explain':'風味プロファイルを考慮','coffee.ethiopia':'エチオピア ナチュラル','coffee.colombia':'コロンビア スプリモ','coffee.indonesia':'インドネシア マンデリン','coffee.kenya':'ケニア AA','dashboard.ai_quote':'「あなたは明るく果実味のあるコーヒーを好みます — 本日はエチオピア ナチュラルをおすすめします。」',},{

    'how.toggle':'仕組み ▾','how.step1':'データ収集: 評価、クリック、再購入','how.step2':'特徴化: 焙煎・産地・風味を標準的な特徴に変換','how.step3':'推薦: 協調フィルタリングとコンテンツベースのハイブリッドモデル','how.step4':'説明: 推薦理由（特徴寄与）を可視化',

    'barista.diagnosis_title':'診断例','barista.diagnosis.over':'過抽出','barista.diagnosis.over_desc':'抽出時間が長く苦味が強い','barista.diagnosis.over_explain':'提案: 粒度を1段階粗くする、または抽出時間を5秒短縮','barista.elevator.title':'一行説明','barista.elevator.body':'実習データを入力すると、AIが抽出の問題を分析し、改善案を提案します。',
    'barista.diagnosis.under':'抽出不足','barista.diagnosis.under_desc':'時間が短く酸味が強い','barista.diagnosis.under_explain':'提案: 粒度を1段階細かくする、または抽出時間を5秒延長',
    'barista.diagnosis.balance':'バランスの問題','barista.diagnosis.balance_desc':'味が平坦','barista.diagnosis.balance_explain':'提案: ドーシングを微調整し、抽出比率をチェック',
    'barista.input_title':'実習データを入力してみる','barista.label.grind':'グラインド','barista.label.grind_hint':'(1=細かい · 10=粗い)','barista.label.time':'抽出時間 (秒)','barista.label.dose':'ドース (g)','barista.label.yield':'イールド (ml)',
    'barista.label.taste':'味の評価','barista.taste.bitter':'苦味','barista.taste.sour':'酸味','barista.taste.bland':'平坦',
    'barista.btn.analyze':'解析','barista.btn.reset':'リセット','barista.result.title':'診断','barista.sample_prompt':'実習値を入力して[解析]を押してください','barista.sample_recommend':'','barista.result.recommend_prefix':'提案:','barista.result.ok':'良好な抽出（基準内）','barista.result.ok_explain':'設定は安定しています。好みに合わせて微調整しましょう。',
    'barista.chart.time_label':'抽出時間','barista.chart.conf_label':'自信度','barista.chart.sparkline_label':'最近のスコア','barista.compare_note':'（前回の実習と比較した改善ポイントがここに表示されます）','barista.session_title':'最近の実習記録','barista.time_actual':'実際:','barista.time_ideal':'理想: 24–30s',

    'cafe.alerts_title':'リアルタイムアラート','cafe.alert.stock':'在庫警告','cafe.alert.stock_text':'エスプレッソ豆 — 約48時間で不足','cafe.alert.surge':'販売急増','cafe.alert.surge_text':'今日の12~13時、アメリカーノ販売 +34%','cafe.alert.weather':'予測','cafe.alert.weather_text':'明日は雨の予報 — 温かい飲料の需要 +18%','cafe.alert.stock_explain':'現在の消費と入荷ペースに基づき自動生成されます。','cafe.alert.surge_explain':'過去の同じ曜日/時間と比較した変動です。','cafe.alert.weather_explain':'天気予報と過去の販売パターンに連動しています。','cafe.predictions_title':'予測と提案','cafe.pred.menu':'メニュー予測','cafe.pred.staff':'人員提案','cafe.pred.promo':'プロモーションアイデア','cafe.method.ts':'(方法: 時系列モデル + 外部変数補正)','cafe.method.staff':'(方法: 過去のピーク相関分析)','cafe.method.promo':'(方法: 低販売区間の自動検出とA/Bアイデア)','cafe.ai_quote':'「午後6時以降アイス飲料の需要が減ると予想されます — デザートプロモーションを検討してください。」','cafe.metric.sales_label':'本日の予想売上','cafe.metric.sales_sub_label':'予測信頼度','cafe.metric.sales_explain':'予測は過去30日間の販売データ、在庫、予約/イベントを組み合わせて算出します。','cafe.metric.top3_label':'人気 TOP 3','cafe.top.item1':'アイスラテ','cafe.top.item2':'アメリカーノ','cafe.top.item3':'バニラフラペチーノ','cafe.metric.top3_sub':'リアルタイム販売を反映','cafe.metric.top3_explain':'Topメニューは過去7日間のトレンドとリアルタイム注文を組み合わせて集計されます','cafe.metric.stock_label':'在庫警告','cafe.metric.stock_value':'エスプレッソ豆 — 2日後に不足','cafe.metric.stock_sub':'優先発注推奨','cafe.metric.stock_explain':'現在の消費速度に基づいて不足予想日数を算出します。','cafe.pred.menu_body':'明日は雨の予報 — 温かい飲料の需要が18%増加します。','cafe.pred.menu_suggest':'提案:','cafe.pred.menu_action':'温かい飲料のプロモーション','cafe.pred.staff_body':'予想ピーク: 平日12–14時 → バリスタ1名増員推奨','cafe.pred.promo_body':'夕方のデザート販売が低め → デザート＋ドリンクセット割引を推奨','cafe.metrics_aria':'主要指標','cafe.tag.practical':'実務型AI','cafe.tag.data':'データ分析','cafe.tag.predict':'予測・アラート','modal.cafe.img_alt':'カフェAIアシスタントのスクリーンショット',

    'contact.title':'お問い合わせ','contact.sub':'プロジェクトに関するお問い合わせや協業のご提案は下のフォームをご利用ください。',
    'contact.name_label':'名前','contact.name_placeholder':'Donguk Lee','contact.email_label':'メール','contact.email_placeholder':'you@example.com',
    'contact.message_label':'メッセージ','contact.message_placeholder':'メッセージを入力してください','contact.send_btn':'送信',

    'meta.title':'Donguk Lee — ポートフォリオ','meta.description':'コーヒープロジェクトとフロントエンド作品に焦点を当てたモダンで反応的な個人ポートフォリオです。',
    'footer.name':'Donguk Lee','footer.rights':'All rights reserved.','social.github':'GitHub','social.email':'Email','social.github_aria':'GitHub を表示','social.email_aria':'メールを送る',
    'form.name_error':'お名前を2文字以上入力してください。','form.email_error':'有効なメールアドレスを入力してください。','form.message_error':'メッセージを10文字以上入力してください。','form.sending':'送信中...','form.sent':'メッセージが送信されました。ありがとうございます！',
    'dashboard.pred.rec_template':'「おすすめ: {coffee}（類似度 {sim}%） — {explain}」'
  });
  Object.assign(translations.ko, {
    'meta.title':'Donguk Lee — 포트폴리오','meta.description':'커피 프로젝트와 프론트엔드 작업에 중점을 둔 모던하고 반응형 개인 포트폴리오입니다.',
    'nav.logo_aria':'홈으로 이동','nav.logo_text':'포트폴리오','nav.lang_aria':'언어 선택','nav.theme_toggle_aria':'테마 변경 (다크/라이트)','nav.theme_toggle':'테마 전환',
    'nav.projects':'프로젝트','nav.about':'소개','nav.contact':'문의',
    'hero.cta_projects':'프로젝트 보기','hero.cta_contact':'연락하기',
    'projects.title':'선택된 프로젝트','projects.sub':'간단한 프로젝트 소개와 링크를 확인할 수 있습니다.',
    'card1.title':'AI 커피 큐레이션','card1.desc':'사용자 취향 기반 추천을 제공하는 학습형 커피 큐레이션 대시보드',
    'card2.title':'카페 운영 AI 어시스턴트','card2.desc':'카페 판매 데이터를 분석해 매출·재고·메뉴 전략을 지원하는 실무형 AI 어시스턴트','card2.img_alt':'커피 원두 이미지','card1.img_alt':'라떼 아트 이미지','card3.img_alt':'에스프레소 추출 이미지','modal.dashboard.img_alt':'라떼 아트','modal.barista.img_alt':'에스프레소 추출','modal.close':'닫기','modal.dashboard.tag.reco':'추천 시스템','modal.dashboard.tag.ai':'AI / ML','modal.dashboard.tag.viz':'데이터 시각화','modal.barista.tag.training':'교육용 AI','modal.barista.tag.feedback':'실습 피드백','modal.barista.tag.data':'데이터 기반','modal.dashboard.tech_title':'기술적 접근 (Tech)',
    'card3.title':'AI 바리스타 트레이너','card3.desc':'바리스타 실습 데이터를 분석해 추출 문제를 진단하고 개선 가이드를 제안하는 교육용 AI',
    'detail_btn':'자세히',
    'modal.dashboard.title':'AI 커피 큐레이션 — 대시보드','modal.dashboard.sub':'사용자 취향 기반 추천을 제공하는 학습형 커피 큐레이션 대시보드','modal.dashboard.tech_desc':'데이터 정규화, 취향 벡터화, 하이브리드 추천 모델로 정확도와 설명력을 확보합니다.','modal.dashboard.impact_title':'기대 효과 (Impact)','modal.dashboard.impact_body':'사용자는 취향에 맞는 커피를 쉽게 발견하고, 로스터리는 개인화된 고객 경험으로 매출을 개선할 수 있습니다.',
    'modal.barista.title':'AI 바리스타 트레이너','modal.barista.sub':'실습 데이터를 입력하면 추출 문제를 진단하고 구체적인 개선안을 제안하는 교육용 AI',
    'modal.cafe.title':'카페 운영 AI 어시스턴트','modal.cafe.sub':'카페 판매 데이터를 분석해 매출·재고·메뉴 전략을 지원하는 실무형 AI 어시스턴트',

    'dashboard.metric.recs_label':'오늘 추천 수','dashboard.metric.recs_sub':'최근 변화','dashboard.metric.recs_explain':'이 수치는 실시간 행동(클릭·평점) 기반으로 변합니다.',
    'dashboard.metric.acc_label':'추천 적중률','dashboard.metric.acc_sub':'평균 만족도','dashboard.metric.acc_explain':'추천 후 평가 및 재구매로 적중률을 추적합니다.',
    'dashboard.metric.new_label':'새로운 추천','dashboard.metric.new_sub':'이번 주','dashboard.metric.new_explain':'사용자별로 새롭게 발굴된 추천 수입니다.',
    'dashboard.alerts_title':'빠른 알림','dashboard.alert.trend':'트렌드','dashboard.alert.trend_text':'내추럴 프로파일의 관심 증가','dashboard.alert.reaction':'반응','dashboard.alert.reaction_text':'추천된 커피 평균 평점 4.6/5','dashboard.alert.repeat':'재추천 증가','dashboard.alert.repeat_text':'최근 7일간 재구매 빈도 +11%',
    'dashboard.predictions_title':'추천 예시 & 제안','dashboard.pred.today_title':'오늘의 추천','dashboard.pred.today_body':'"당신에게 추천: 에티오피아 내추럴 (유사도 87%) — 산미·베리향 선호 반영"','dashboard.pred.try_title':'시도 권장','dashboard.pred.try_body':'신규 블렌드 테스트 → 추천 반응이 좋을 시 캠페인 전개','dashboard.pred.rec_template':'"당신에게 추천: {coffee} (유사도 {sim}%) — {explain}"','dashboard.pred.rec_explain':'향미 프로파일 반영','coffee.ethiopia':'에티오피아 내추럴','coffee.colombia':'콜롬비아 수프리모','coffee.indonesia':'인도네시아 만델링','coffee.kenya':'케냐 AA','dashboard.ai_quote':'"당신은 밝고 과일향의 커피를 선호합니다 — 오늘은 에티오피아 내추럴을 추천합니다."',

    'how.toggle':'작동 원리 ▾','how.step1':'데이터 수집: 평가, 클릭, 재구매 데이터 수집','how.step2':'특성화: 로스팅·산지·향미를 표준 특성으로 변환','how.step3':'추천: 협업 필터링 + 콘텐츠 기반 혼합 모델 적용','how.step4':'설명: 추천 이유(특성 기여도)를 시각화',

    'barista.diagnosis_title':'문제 진단 예시','barista.diagnosis.over':'과다 추출','barista.diagnosis.over_desc':'추출 시간이 길고 쓴맛이 강함','barista.diagnosis.over_explain':'추천: 분쇄도를 1단계 굵게 또는 추출 시간 5초 단축',
    'barista.diagnosis.under':'과소 추출','barista.diagnosis.under_desc':'시간 짧고 신맛이 강함','barista.diagnosis.under_explain':'추천: 분쇄도를 1단계 더 가늘게 또는 추출 시간 5초 연장',
    'barista.diagnosis.balance':'균형 문제','barista.diagnosis.balance_desc':'맛이 밋밋함','barista.diagnosis.balance_explain':'추천: 도징량 미세 조정 및 물-커피 비율 검토',
    'barista.input_title':'실습 입력 해보기','barista.label.grind':'분쇄도','barista.label.grind_hint':'(1=가늘게 · 10=굵게)','barista.label.time':'추출 시간 (초)','barista.label.dose':'도징량 (g)','barista.label.yield':'추출량 (ml)',
    'barista.label.taste':'맛 평가','barista.taste.bitter':'쓴맛','barista.taste.sour':'신맛','barista.taste.bland':'밋밋함',
    'barista.btn.analyze':'분석 시작','barista.btn.reset':'초기화','barista.result.title':'진단','barista.sample_prompt':'폼에서 값을 입력하고 [분석 시작]을 눌러보세요.','barista.sample_recommend':'','barista.result.recommend_prefix':'권장:','barista.chart.time_label':'추출 시간','barista.chart.conf_label':'자신도','barista.chart.sparkline_label':'최근 점수','barista.compare_note':'(이전 실습과 비교한 개선 포인트가 여기에 표시됩니다)','barista.session_title':'최근 실습 기록','barista.time_actual':'실제:','barista.time_ideal':'이상적: 24–30s',

    'cafe.alerts_title':'실시간 알림','cafe.alert.stock':'재고 경고','cafe.alert.stock_text':'에스프레소 원두 재고 12kg — 48시간 내 부족 예상','cafe.alert.surge':'판매 급증','cafe.alert.surge_text':'오늘 12~13시 아메리카노 판매 +34%','cafe.alert.weather':'예측','cafe.alert.weather_text':'내일 비 예보 — 따뜻한 음료 판매 +18%','cafe.alert.stock_explain':'현재 소모 속도 및 입고 주기를 기반으로 자동 생성됩니다.','cafe.alert.surge_explain':'이전 동일 요일·시간의 평균 대비 변동입니다.','cafe.alert.weather_explain':'날씨 예보와 과거 판매 패턴을 연동합니다.','cafe.predictions_title':'예측 & 제안','cafe.pred.menu':'메뉴 예측','cafe.pred.staff':'인력 제안','cafe.pred.promo':'프로모션 아이디어','cafe.method.ts':'(방법: 시계열 모델 + 외부 변수 보정)','cafe.method.staff':'(방법: 과거 피크 상관관계 분석)','cafe.method.promo':'(방법: 판매 저조 구간 자동 탐지 및 A/B 아이디어)','cafe.metric.sales_label':'오늘 예상 매출','cafe.metric.sales_sub_label':'예측 신뢰도','cafe.metric.sales_explain':'예측은 지난 30일 판매 데이터, 현재 재고 상태, 예약/이벤트 정보를 결합해 산출됩니다.','cafe.metric.top3_label':'인기 TOP 3','cafe.top.item1':'아이스 라떼','cafe.top.item2':'아메리카노','cafe.top.item3':'바닐라 프라푸치노','cafe.metric.top3_sub':'실시간 판매 반영','cafe.metric.top3_explain':'Top 메뉴는 최근 7일간 판매 추세와 실시간 주문을 반영해 집계됩니다.','cafe.metric.stock_label':'재고 경고','cafe.metric.stock_value':'에스프레소 원두 — 2일 후 부족','cafe.metric.stock_sub':'우선 발주 권장','cafe.metric.stock_explain':'현재 소모 속도를 바탕으로 부족 예상 일수를 자동 계산해 알림을 제공합니다.','cafe.pred.menu_body':'내일 비 예보 — 따뜻한 음료 판매 18% 증가.','cafe.pred.menu_suggest':'제안:','cafe.pred.menu_action':'따뜻한 음료 프로모션','cafe.pred.staff_body':'예상 피크: 평일 12–14시 → 추가 바리스타 1명 배치 권장','cafe.pred.promo_body':'저녁 디저트 판매가 낮음 → 디저트+음료 세트 할인 추천','cafe.metrics_aria':'핵심 지표','cafe.tag.practical':'실무형 AI','cafe.tag.data':'데이터 분석','cafe.tag.predict':'예측·경고','modal.cafe.img_alt':'카페 AI 어시스턴트 스크린샷',

    'contact.title':'문의','contact.sub':'프로젝트 관련 문의나 협업 제안은 아래 양식을 이용해주세요.',
    'contact.name_label':'이름','contact.name_placeholder':'홍길동','contact.email_label':'이메일','contact.email_placeholder':'you@example.com',
    'contact.message_label':'메시지','contact.message_placeholder':'문의 내용을 입력하세요','contact.send_btn':'보내기',
    'footer.name':'Donguk Lee','footer.rights':'모든 권리 보유.','social.github':'GitHub','social.email':'이메일','social.github_aria':'GitHub 보기','social.email_aria':'이메일 보내기'
  });

  function setLanguage(lang){
    const map = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if(key && map[key]) el.textContent = map[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if(key && map[key]) el.placeholder = map[key];
    });

    // Set title and meta description if provided
    const metaTitleEl = document.getElementById('meta-title');
    if(metaTitleEl && map['meta.title']) metaTitleEl.textContent = map['meta.title'];
    const metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc && map['meta.description']) metaDesc.setAttribute('content', map['meta.description']);

    // Set aria labels for elements that declare data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      if(key && map[key]) el.setAttribute('aria-label', map[key]);
    });

    // Set alt text for images with data-i18n-alt
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.dataset.i18nAlt;
      if(key && map[key]) el.setAttribute('alt', map[key]);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    // refresh dashboard sample so the rec-example uses the current language
    const dashboardModal = document.getElementById('modal-dashboard');
    if(dashboardModal) populateDashboardSample(dashboardModal);

    // ensure document language and persist
    document.documentElement.lang = lang;
    localStorage.setItem('siteLang', lang);
  }

  // Initialize language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', ()=> setLanguage(btn.dataset.lang)));
  const savedLang = localStorage.getItem('siteLang');
  if(savedLang) setLanguage(savedLang);
  else {
    const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if(navLang.startsWith('ja')) setLanguage('ja');
    else if(navLang.startsWith('ko')) setLanguage('ko');
    else setLanguage('en');
  }

});