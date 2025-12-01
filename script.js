// ✅ Cleaned and unified script.js


// --- Particle background (safe wrapper) ---
(function(){
  try {
    if (window.tsParticles && typeof tsParticles.load === 'function') {
      tsParticles.load("tsparticles", {
        fpsLimit: 60,
        particles: {
          number: { value: 50 },
          color: { value: ["#4a90e2", "#357ab8", "#1f4e8c"] },
          shape: { type: "circle" },
          opacity: { value: 0.18, random: true },
          size: { value: { min: 2, max: 4 } },
          move: { enable: true, speed: 0.3, outModes: { default: "out" }, random: true }
        },
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" } },
          modes: { repulse: { distance: 100, duration: 0.4 } }
        },
        detectRetina: true,
        background: { color: "transparent" }
      });
    }
  } catch(e) { console.warn("Particles init error", e); }
})();

// --- Scroll reveal animation ---
(function(){
  const items = document.querySelectorAll('.animate-on-scroll');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
})();

// --- Parallax (shapes + hero video + hero text float) ---
(function(){
  const shapes = document.querySelectorAll('.shape');
  const heroVideo = document.getElementById('hero-video');
  const heroContent = document.querySelector('.hero-content');
  
  function onScroll(){
    const y = window.scrollY || window.pageYOffset;
    shapes.forEach((s, i) => s.style.transform = `translateY(${y * (i+1)*0.15}px)`);
    if (heroVideo) heroVideo.style.transform = `translateY(${y * 0.28}px)`;
    if (heroContent) heroContent.style.transform = `translateY(${Math.max(0, -y * 0.02)}px)`;
  }
  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
})();

// --- ✅ MOBILE NAV TOGGLE (FIXED) ---
(function(){
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (!navToggle || !navLinks) {
    console.warn('Mobile nav elements not found');
    return;
  }

  // Toggle menu on burger click
  navToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    
    console.log('Menu toggled:', isOpen); // Debug log
  });

  // Close menu when clicking on links
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
})();

// --- Page ready: hero + service reveal ---
window.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.classList.add('visible');

  const serviceHero = document.querySelector('.service-hero');
  if (serviceHero) serviceHero.classList.add('visible');

  document.querySelectorAll('main.content section').forEach(sec => {
    setTimeout(() => sec.classList.add('visible'), 80);
  });
});

// --- Scroll progress line ---
(function(){
  const bar = document.querySelector('.scroll-progress-line');
  if (!bar) return;

  function updateScrollLine() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollTop / docHeight, 1);
    bar.style.height = `${progress * 90}vh`;
  }

  window.addEventListener('scroll', updateScrollLine, { passive: true });
  updateScrollLine();
})();

// --- Parallax on section icons ---
(function(){
  const images = Array.from(document.querySelectorAll('.parallax-img img'));
  if (!images.length) return;

  const PARALLAX_STRENGTH = 0.12;

  function updateParallax(){
    const vh = window.innerHeight;
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      const progress = ((rect.top + rect.height/2) - vh/2) / (vh/2);
      const offset = -progress * (vh * PARALLAX_STRENGTH);
      img.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  }

  let ticking = false;
  function onScroll(){
    if (!ticking){
      requestAnimationFrame(() => { updateParallax(); ticking = false; });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', updateParallax);
  updateParallax();
})();

// --- BA page motion (GSAP + ScrollTrigger) ---
(function(){
  const hasGSAP = window.gsap && window.ScrollTrigger;
  const tiles = document.querySelectorAll('.ba-section .parallax-tile img');
  const overlay = document.querySelector('.neural-overlay');
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (overlay){
    if (hasGSAP && !prefersReduce){
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(overlay, { opacity: 0.45, duration: 1.2, ease: 'power2.out' });
      gsap.to(overlay, {
        yPercent: 6, duration: 2, ease: 'none',
        scrollTrigger: { trigger: overlay, start: 'top top', end: 'bottom top', scrub: true }
      });
    } else {
      overlay.style.opacity = '.45';
    }
  }

  if (hasGSAP && !prefersReduce){
    document.querySelectorAll('.ba-section').forEach((sec, i) => {
      gsap.fromTo(sec,
        {opacity:0, y:24, scale:0.985},
        {
          opacity:1, y:0, scale:1, duration:0.9, ease:'power3.out',
          scrollTrigger:{ trigger: sec, start:'top 78%', toggleActions:'play none none reverse' },
          delay: i * 0.03
        }
      );
    });
  }

  function updateParallaxTile(img){
    const rect = img.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = ((rect.top + rect.height/2) - vh/2) / (vh/2);
    const strength = 16;
    const y = Math.max(-strength, Math.min(strength, -progress * strength));
    img.style.transform = `translateY(${y.toFixed(1)}px)`;
  }
  
  function onScroll(){
    tiles.forEach(updateParallaxTile);
  }

  if (!prefersReduce){
    if (hasGSAP){
      ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: onScroll
      });
    } else {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking){ requestAnimationFrame(()=>{ onScroll(); ticking=false; }); ticking=true; }
      }, {passive:true});
    }
    onScroll();
    window.addEventListener('resize', onScroll);
  }
})();

// --- AI parallax overlay ---
(function(){
  const overlay = document.querySelector('.ai-overlay');
  if (!overlay) return;

  window.addEventListener('DOMContentLoaded', () => {
    overlay.classList.add('visible');
  });

  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.15;
    overlay.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
})();

// --- Handshake scroll animation ---
(function(){
  const overlay = document.querySelector('.handshake-overlay');
  if (!overlay) return;

  const left  = overlay.querySelector('.hand-left');
  const right = overlay.querySelector('.hand-right');
  const flash = overlay.querySelector('.hand-light');
  if (!left || !right || !flash) return;

  const clamp = x => Math.max(0, Math.min(1, x));

  function updateHandshake() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const scrollRange = (doc.scrollHeight - window.innerHeight) || 1;
    const SPEED = 1.6;
    const t = clamp((scrollTop / scrollRange) * SPEED);

    const max = window.innerWidth * 0.45;
    left.style.setProperty('--dx-left',  (t * max) + "px");
    right.style.setProperty('--dx-right', (t * max) + "px");

    const flashPos = 0.9, width = 0.12;
    const f = Math.max(0, 1 - Math.abs(t - flashPos) / width);
    flash.style.setProperty('--flash', f);
    flash.style.setProperty('--flash-scale', 1 + f * 0.9);

    const fade = clamp(1 - Math.abs(t - 0.6) * 3);
    overlay.style.setProperty('--hand-opacity', fade);
  }

  window.addEventListener('scroll', updateHandshake, { passive:true });
  window.addEventListener('resize', updateHandshake);
  updateHandshake();
})();

// --- Golden spark animation ---
(function(){
  const canvas = document.getElementById("golden-spark");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  let particles = [];
  let lastSpawn = 0;

  function spawnSpark(){
    const cx = w / 2;
    const cy = h / 2;

    const count = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2) * (i / count);
      const speed = 0.8 + Math.random() * 1.4;

      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2.5,
        color: `hsl(${45 + Math.random()*15}, 90%, 60%)`
      });
    }
  }

  function loop(timestamp){
    ctx.clearRect(0,0,w,h);

    if (timestamp - lastSpawn > 1800 + Math.random()*900){
      spawnSpark();
      lastSpawn = timestamp;
    }

    particles.forEach((p, i)=>{
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0){
        particles.splice(i, 1);
        return;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

// Reduce animation load on small devices
if (window.innerWidth < 900 && window.gsap) {
  gsap.globalTimeline.timeScale(1.2);
}
const bubble = document.getElementById("ai-chat-bubble");
const windowBox = document.getElementById("ai-chat-window");
const messagesBox = document.getElementById("ai-chat-messages");
const input = document.getElementById("chat-message");
const sendBtn = document.getElementById("chat-send");

bubble.onclick = () => {
  windowBox.style.display =
    windowBox.style.display === "flex" ? "none" : "flex";
};

// Run once on load
window.addEventListener("DOMContentLoaded", () => {
  addMessage("assistant", "Hello! I'm your Spitfox AI Assistant. How can I help you today?");
  const suggestions = getSuggestions(" ");
  addSuggestions(suggestions);
});

function addMessage(role, text) {
  const chat = document.getElementById("ai-chat-messages");
  const msg = document.createElement("div");

  if (role === "assistant") {
    msg.className = "message bot-message";
    msg.innerHTML = `
      <img src="images/fox.png" class="bot-avatar" />
      <div class="bot-text">${text}</div>
    `;
  } else {
    msg.className = "message user-message";
    msg.innerHTML = `<p>${text}</p>`;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
function addSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) {
    console.error("Suggestions is not an array:", suggestions);
    return;
  }

  const chat = document.getElementById("ai-chat-messages");

  const wrapper = document.createElement("div");
  wrapper.className = "suggestion-wrapper";

  wrapper.innerHTML = `
    <div class="quick-replies">
      ${suggestions.map(s => `<button class="quick-btn">${s}</button>`).join("")}
    </div>
  `;

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}
app.get("/", (req, res) => {
  res.send("API is running.");
});


input.addEventListener("keydown", function(e) {
	  if (e.key === "Enter" && !e.ctrlKey) {
		e.preventDefault();
		sendMessage();
	  }

	  if (e.key === "Enter" && e.ctrlKey) {
		input.value += "\n";
	  }
	});

sendBtn.addEventListener("click", sendMessage);

function sendMessage() {
  const input = document.getElementById("chat-message");
  const text = input.value.trim();
  if (!text) return;
	

  addMessage("user", text);
  input.value = "";

  fetch("https://server-enor.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => {
      addMessage("assistant", data.reply);
	  
	       // suggestions after bot reply
        const suggestions = getSuggestions(text);
        addSuggestions(suggestions);
    });
}


document.addEventListener("click", function (e) {

  // QUICK REPLY BUBBLES
  if (e.target.classList.contains("quick-btn")) {
    const text = e.target.textContent;

    addMessage("user", text);

    fetch("https://server-enor.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(res => res.json())
      .then(data => {
        addMessage("assistant", data.reply);

        // suggestions after bot reply
        const suggestions = getSuggestions(text);
        addSuggestions(suggestions);
      });
  }

  // BOOK NOW BUTTON (REDIRECT TO CALENDLY)
  if (e.target.classList.contains("cal-btn")) {
    window.location.href =
      "https://calendly.com/spitfoxitservices-info/30min";
  }

});

function getSuggestions(userText) {
  const lower = userText.toLowerCase();

  if (lower.includes("spitfox") || lower.includes("company")) {
    return ["What is your vision", "What is your mission?", "Show services"];
  }
  
    if (lower.includes("mission") || lower.includes("vision")|| lower.includes("restart")) {
    return ["What is Spitfox IT Services?", "What is your philosophy?", "Show services"];
  }
    if (lower.includes("philosophy") ) {
    return ["What is Spitfox IT Services?", "What is your vision?", "Show services"];
  }

  if (lower.includes("service")) {
    return ["Project Management", "Business Analysis", "AI Automation"];
  }

  if (lower.includes("project")||lower.includes("management")||lower.includes("agile")) {
    return ["What Industries do you support", "More services", "Book a call"];
  }

  if (lower.includes("analysis")||lower.includes("requirements")) {
    return ["What Industries do you support", "More services", "Book a call"];
  }

  if (lower.includes("ai") || lower.includes("automation") || lower.includes("chatbot")) {
    return ["What Industries do you support", "More services", "Book a call"];
  }
  
   if (lower.includes("industries")||lower.includes("requirements")) {
    return [ "More services", "Book a call"];
  }


  // ALWAYS return array here
  return ["What is Spitfox?", "What services do you provide?"];
}
