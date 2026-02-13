// === CONFIGURA AQUÍ TU WHATSAPP ===
// Formato recomendado: país + número, sin "+" ni espacios.
// Ej México: 5215512345678  |  Colombia: 573001234567  |  España: 34600123456
const WHATSAPP_NUMBER = "5356859619"; // <-- CAMBIA ESTO
const DEFAULT_MESSAGE = "Hola, quiero agendar una cita en Kairos Lab. ¿Qué disponibilidad tienen?";

const services = [
  { name: "Corte de cabello", desc: "Corte clásico, moderno o degradado. Terminación limpia y detallada.", minutes: 45, price: "$$$" },
  { name: "Barba", desc: "Perfilado, recorte y acabado. Toalla caliente opcional.", minutes: 30, price: "$$$" },
  { name: "Cejas", desc: "Diseño y limpieza para un look más definido.", minutes: 15, price: "$$" },
  { name: "Lavado de cabeza", desc: "Lavado + masaje capilar para cerrar el servicio perfecto.", minutes: 15, price: "$$" },
  { name: "Tratamientos capilares", desc: "Hidratación, reparación o control de frizz según tu necesidad.", minutes: 40, price: "$$$$" },
];

const products = window.KAIROS_PRODUCTS || [];
const isCatalogPage = document.body?.dataset?.page === "catalogo";
const visibleProducts = isCatalogPage ? products : products.slice(0, 3);

function getCategoryFallback(category) {
  const key = (category || "").toLowerCase();
  if (key === "barba") return "assets/products/barba.svg";
  if (key === "cuidado") return "assets/products/cuidado.svg";
  if (key === "post afeitado") return "assets/products/post-afeitado.svg";
  return "assets/products/styling.svg";
}

function buildWhatsAppLink(message) {
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    console.warn("WHATSAPP_NUMBER inválido. Usa solo dígitos, sin '+' ni espacios.");
  }
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function setCtaLinks() {
  const link = buildWhatsAppLink(DEFAULT_MESSAGE);

  const ids = ["btnCitaTop", "btnCitaHero", "btnCitaUbicacion", "floatCta", "waLinkFooter"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = link;
  });
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  grid.innerHTML = services.map((s) => `
    <article class="item">
      <div class="item__top">
        <h3 class="item__title">${s.name}</h3>
        <span class="item__pill">${s.minutes} min</span>
      </div>
      <p class="item__desc">${s.desc}</p>
      <div class="item__actions">
        <span class="price">${s.price}</span>
        <button class="btn btn--ghost" data-service="${s.name}">Agendar este servicio</button>
      </div>
    </article>
  `).join("");

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-service]");
    if (!btn) return;

    const serviceName = btn.getAttribute("data-service");
    const msg = `Hola, quiero agendar una cita en Kairos Lab. Servicio: ${serviceName}. ¿Qué horarios tienen?`;
    window.open(buildWhatsAppLink(msg), "_blank", "noopener");
  });
}

function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = list.map((p) => `
    <article class="item">
      <div class="item__media">
        <img
          class="item__image"
          src="${p.image || getCategoryFallback(p.category)}"
          data-fallback="${getCategoryFallback(p.category)}"
          alt="${p.name}"
          loading="lazy"
        />
      </div>
      <div class="item__body">
        <div class="item__top">
          <h3 class="item__title">${p.name}</h3>
          <span class="item__pill">${p.category}</span>
        </div>
        <p class="item__desc">${p.desc}</p>
        <div class="item__actions">
          <span class="price">${p.price}</span>
          <button class="btn btn--ghost" data-product="${p.name}">Preguntar por este producto</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".item__image").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallback;
      if (fallback && img.getAttribute("src") !== fallback) {
        img.setAttribute("src", fallback);
      }
    }, { once: true });
  });
}

function initSearch() {
  const input = document.getElementById("productSearch");
  const clearBtn = document.getElementById("clearFilters");
  const grid = document.getElementById("productsGrid");

  if (!input || !clearBtn || !grid) return;

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    const filtered = visibleProducts.filter(p =>
      `${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(q)
    );
    renderProducts(filtered);
  };

  input.addEventListener("input", apply);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    renderProducts(visibleProducts);
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-product]");
    if (!btn) return;

    const productName = btn.getAttribute("data-product");
    const msg = `Hola, quiero información del producto "${productName}" (Kairos Lab). ¿Precio y disponibilidad?`;
    window.open(buildWhatsAppLink(msg), "_blank", "noopener");
  });

  renderProducts(visibleProducts);
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
  });

  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  });
}

function initQuickForm() {
  const form = document.getElementById("quickForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const service = document.getElementById("serviceSelect")?.value || "";
    const name = document.getElementById("nameInput")?.value?.trim() || "";
    const note = document.getElementById("noteInput")?.value?.trim() || "";

    const parts = [
      "Hola, quiero agendar una cita en Kairos Lab.",
      service ? `Servicio: ${service}.` : "",
      name ? `Nombre: ${name}.` : "",
      note ? `Nota: ${note}.` : "",
      "¿Qué disponibilidad tienen?"
    ].filter(Boolean);

    window.open(buildWhatsAppLink(parts.join(" ")), "_blank", "noopener");
  });
}

function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

setCtaLinks();
renderServices();
initSearch();
initMobileNav();
initQuickForm();
initYear();
