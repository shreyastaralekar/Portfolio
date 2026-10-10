/* enhance.js - subtle pointer parallax for the hero doodles */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hero = document.querySelector(".hero");
  const doodles = [...document.querySelectorAll(".doodles svg")];
  if (!hero || !doodles.length) return;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    doodles.forEach((d, i) => {
      const k = (i + 1) * 9;
      d.style.transform = `translate(${(x * k).toFixed(1)}px, ${(y * k).toFixed(1)}px)`;
    });
  });
})();

/* v2: credential wall spotlight + auto-highlight */
(() => {
  const wall = document.querySelector(".cert-groups");
  if (!wall) return;
  const cards = [...wall.querySelectorAll(".cert-card")];
  wall.addEventListener("pointermove", (e) => {
    const c = e.target.closest(".cert-card");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0, paused = false;
  wall.addEventListener("pointerenter", () => (paused = true));
  wall.addEventListener("pointerleave", () => (paused = false));
  setInterval(() => {
    if (paused || document.hidden) return;
    cards.forEach((c, k) => c.classList.toggle("is-lit", k === i));
    i = (i + 1) % cards.length;
  }, 2200);
})();

/* certificate viewer: click a card to open its image or PDF */
(() => {
  const modal = document.getElementById("certModal");
  const cards = [...document.querySelectorAll(".cert-card[href]")];
  if (!modal || !cards.length) return;
  const stage = modal.querySelector(".cert-stage");
  const cap = modal.querySelector("#certCap");
  const openLink = modal.querySelector(".cert-open");
  let idx = 0, last = null;
  const show = (i) => {
    idx = (i + cards.length) % cards.length;
    const c = cards[idx], src = c.getAttribute("href");
    cap.textContent = `${c.dataset.title} - ${c.dataset.org}`;
    openLink.href = src;
    stage.replaceChildren();
    if (/\.pdf($|\?)/i.test(src)) {
      const f = document.createElement("iframe");
      f.src = src; f.title = c.dataset.title;
      stage.append(f);
    } else {
      const im = new Image();
      im.alt = `Certificate: ${c.dataset.title}`;
      im.onerror = () => { stage.textContent = "Certificate image not found."; };
      im.src = src;
      stage.append(im);
    }
  };
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("cert-lock");
    if (last) last.focus();
  };
  cards.forEach((c, i) => c.addEventListener("click", (e) => {
    e.preventDefault();
    last = c; show(i);
    modal.hidden = false;
    document.body.classList.add("cert-lock");
    modal.querySelector(".cert-close").focus();
  }));
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".cert-close")) close(); });
  modal.querySelector(".cert-prev").addEventListener("click", () => show(idx - 1));
  modal.querySelector(".cert-next").addEventListener("click", () => show(idx + 1));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
})();
