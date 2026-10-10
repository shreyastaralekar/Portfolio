/* ============================================================
   PORTFOLIO – ANIMATION ENGINE
   Strategy: each section animates as a "wave" –
   section heading → cards/items one-by-one → buttons last
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 1. TYPED ROLE ── */
const roleEl = document.querySelector("#typed-role");
const roles = ["Software Developer", "Full Stack Developer", "Android Developer", "AI/ML Engineer"];

if (roleEl && !prefersReducedMotion) {
  let roleIndex = 0;
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleEl.style.opacity = "0";
    roleEl.style.transform = "translateY(6px)";
    setTimeout(() => {
      roleEl.textContent = roles[roleIndex];
      roleEl.style.opacity = "1";
      roleEl.style.transform = "translateY(0)";
    }, 200);
  }, 2600);
}

/* ── 2. STAGGERED WAVE REVEAL ── */
function getWaveChildren(section) {
  const waves = [];

  // hero special layout
  if (section.classList.contains("hero")) {
    const heroLeft = section.querySelector(".hero-grid > div");
    const heroCard = section.querySelector(".hero-card");
    if (heroLeft) waves.push([heroLeft]);
    if (heroCard) waves.push([heroCard]);
    return waves;
  }

  // heading block first
  const sh = section.querySelector(".section-head");
  if (sh) waves.push([sh]);

  // contact-card (contact section)
  const contactCard = section.querySelector(".contact-card");
  if (contactCard) waves.push([contactCard]);

  // each card / item individually
  const cards = section.querySelectorAll(
    ".info-card, .project-card, .achievement-item, .timeline-card, .contact-item"
  );
  cards.forEach((c) => waves.push([c]));

  // cert marquee
  const marquee = section.querySelector(".cert-marquee");
  if (marquee) waves.push([marquee]);

  // buttons at end (non-hero)
  const actions = section.querySelector(".hero-actions");
  if (actions) waves.push([actions]);

  return waves;
}

function animateSection(section) {
  const waves = getWaveChildren(section);
  waves.forEach((group, i) => {
    group.forEach((el) => {
      el.style.transitionDelay = `${i * 90}ms`;
      el.classList.remove("wave-hidden");
      el.classList.add("wave-visible");
    });
  });
  section.classList.add("section-visible");
}

function prepareSection(section) {
  const waves = getWaveChildren(section);
  waves.forEach((group) => {
    group.forEach((el) => {
      if (!el.hasAttribute("data-wave")) {
        el.setAttribute("data-wave", "");
        el.classList.add("wave-hidden");
      }
    });
  });
  section.classList.add("section-observe");
}

if (!prefersReducedMotion) {
  const sections = document.querySelectorAll("main .section");
  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSection(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: "0px 0px -48px 0px" }
  );
  sections.forEach((section) => {
    prepareSection(section);
    sectionObserver.observe(section);
  });
} else {
  document.querySelectorAll("main .section").forEach((s) => {
    s.classList.add("section-visible");
    s.querySelectorAll("[data-wave]").forEach((el) => el.classList.add("wave-visible"));
  });
}

/* ── 3. SCROLL UI ── */
const scrollProgress = document.querySelector("#scroll-progress");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sectionNodes = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const backToTop = document.querySelector("#back-to-top");
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("#menu-toggle");

const updateScrollUi = () => {
  const doc = document.documentElement;
  const maxScroll = doc.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (backToTop) backToTop.classList.toggle("show", window.scrollY > 320);
};

const updateActiveNav = () => {
  let current = sectionNodes[0]?.id;
  sectionNodes.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
  });
};

updateScrollUi();
updateActiveNav();
window.addEventListener("scroll", () => { updateScrollUi(); updateActiveNav(); });
window.addEventListener("resize", updateScrollUi);

if (backToTop) {
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ── 4. MOBILE NAV ── */
if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    header.classList.toggle("nav-open", !expanded);
  });
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      header.classList.remove("nav-open");
    });
  });
}

/* ── 5. 3-D TILT CARD ── */
const tiltCard = document.querySelector(".tilt-card");
if (tiltCard && !prefersReducedMotion) {
  tiltCard.addEventListener("mousemove", (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 9;
    const rotX = (0.5 - (e.clientY - rect.top) / rect.height) * 8;
    tiltCard.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
  });
  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

/* ── 6. BUTTON RIPPLE on click ── */
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    const rect = this.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* ── 7. FOOTER YEAR ── */
const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
