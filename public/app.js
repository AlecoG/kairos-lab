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

const rawBase = document.body?.dataset?.base || "/";
const siteBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const BTN_BASE = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8e8e8] px-4 py-3 font-bold";
const BTN_PRIMARY = `${BTN_BASE} border-[#111] bg-[#111] text-white`;
const BTN_GHOST = `${BTN_BASE} bg-transparent text-[#111111]`;
const FLOAT_HIDDEN_CLASSES = ["opacity-0", "invisible", "pointer-events-none", "translate-y-2.5"];

function withBase(path) {
  if (!path) return path;
  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${siteBase}${String(path).replace(/^\/+/, "")}`;
}

function setFloatHidden(element, hidden) {
  if (!element) return;
  FLOAT_HIDDEN_CLASSES.forEach((className) => {
    element.classList.toggle(className, hidden);
  });
}

const products = window.KairosStore
  ? window.KairosStore.getProducts(window.KAIROS_PRODUCTS || [])
  : (window.KAIROS_PRODUCTS || []);
const isCatalogPage = document.body?.dataset?.page === "catalogo";
const visibleProducts = products.filter((p) => p.visible !== false && p.enabled !== false);
const storefrontProducts = isCatalogPage ? visibleProducts : visibleProducts.slice(0, 3);

function getCategoryFallback(category) {
  const key = (category || "").toLowerCase();
  if (key === "barba") return withBase("assets/products/barba.svg");
  if (key === "cuidado") return withBase("assets/products/cuidado.svg");
  if (key === "post afeitado") return withBase("assets/products/post-afeitado.svg");
  return withBase("assets/products/styling.svg");
}

function getOptimizedSources(imagePath) {
  const normalizedPath = withBase(imagePath || "");
  if (!imagePath || !/\.jpg$/i.test(imagePath)) {
    return { src: normalizedPath, srcset: "", original: normalizedPath };
  }

  const base = normalizedPath.replace(/\.jpg$/i, "");
  return {
    src: `${base}-480.webp`,
    srcset: `${base}-480.webp 480w, ${base}-960.webp 960w`,
    original: normalizedPath,
  };
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

  const ids = isCatalogPage
    ? ["btnCitaTop", "waLinkFooter"]
    : ["btnCitaTop", "btnCitaHero", "btnCitaUbicacion", "floatCta", "waLinkFooter"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = link;
  });
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  grid.innerHTML = services.map((s) => `
    <article class="grid min-h-[160px] gap-2.5 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,.05)] transition-all duration-200 hover:scale-[1.01] hover:border-[#d6d6d6] hover:shadow-[0_14px_28px_rgba(0,0,0,.1)]">
      <div class="flex items-start justify-between gap-4">
        <h3 class="m-0 text-[1.1rem]">${s.name}</h3>
        <span class="whitespace-nowrap rounded-full border border-[#e8e8e8] bg-[rgba(0,0,0,.02)] px-2.5 py-1 text-[.85rem] font-extrabold text-[#6b6b6b]">${s.minutes} min</span>
      </div>
      <p class="m-0 leading-relaxed text-[#6b6b6b]">${s.desc}</p>
      <div class="flex flex-wrap items-center gap-2.5 pt-1">
        <span class="font-black">${s.price}</span>
        <button class="${BTN_GHOST}" data-service="${s.name}">Agendar este servicio</button>
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

  grid.innerHTML = list.map((p) => {
    const optimized = getOptimizedSources(p.image || "");
    const isOutOfStock = p.stockStatus === "agotado";
    const statusLabel = isOutOfStock
      ? `<span class="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-700">Agotado</span>`
      : "";
    return `
    <article class="grid min-h-[160px] gap-2.5 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,.05)] transition-all duration-200 hover:scale-[1.01] hover:border-[#d6d6d6] hover:shadow-[0_14px_28px_rgba(0,0,0,.1)] max-[640px]:[flex:0_0_84%]">
      <div class="overflow-hidden rounded-xl border border-[#e8e8e8] bg-gradient-to-b from-[#fafafa] to-[#efefef] p-1">
        <img
          class="js-product-image block h-[310px] w-full origin-center object-contain transition-transform duration-300 ease-out hover:scale-105"
          src="${optimized.src || getCategoryFallback(p.category)}"
          srcset="${optimized.srcset}"
          sizes="(max-width: 640px) 84vw, (max-width: 920px) 48vw, 32vw"
          data-original="${optimized.original || ""}"
          data-fallback="${getCategoryFallback(p.category)}"
          alt="${p.name}"
          width="960"
          height="960"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="grid gap-2.5">
        <div class="flex items-start justify-between gap-4">
          <h3 class="m-0 text-[1.1rem]">${p.name}</h3>
          <span class="whitespace-nowrap rounded-full border border-[#e8e8e8] bg-[rgba(0,0,0,.02)] px-2.5 py-1 text-[.85rem] font-extrabold text-[#6b6b6b]">${p.category}</span>
        </div>
        <p class="m-0 leading-relaxed text-[#6b6b6b]">${p.desc}</p>
        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <span class="font-black">${p.price}</span>
          ${statusLabel}
          ${isCatalogPage ? `<button class="${BTN_PRIMARY} disabled:cursor-not-allowed disabled:opacity-50" data-add-product="${p.name}" ${isOutOfStock ? "disabled" : ""}>${isOutOfStock ? "No disponible" : "Agregar al carrito"}</button>` : ""}
          <button class="${BTN_GHOST}" data-product="${p.name}">Preguntar por este producto</button>
        </div>
      </div>
    </article>
  `;
  }).join("");

  grid.querySelectorAll(".js-product-image").forEach((img) => {
    img.addEventListener("error", () => {
      const original = img.dataset.original;
      const fallback = img.dataset.fallback;

      if (original && img.getAttribute("src") !== original) {
        img.removeAttribute("srcset");
        img.setAttribute("src", original);
        return;
      }

      if (fallback && img.getAttribute("src") !== fallback) {
        img.removeAttribute("srcset");
        img.setAttribute("src", fallback);
      }
    }, { once: true });
  });
}

function initSearch() {
  const input = document.getElementById("productSearch");
  const clearBtn = document.getElementById("clearFilters");
  const grid = document.getElementById("productsGrid");
  const categoryFilters = document.getElementById("categoryFilters");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const clearCartBtn = document.getElementById("clearCart");
  const buyCartBtn = document.getElementById("buyCart");
  const floatBuyBtn = document.getElementById("floatCta");

  if (!input || !clearBtn || !grid) return;

  const categories = Array.from(
    new Set(storefrontProducts.map((p) => p.category).filter(Boolean))
  );
  const productByName = new Map(storefrontProducts.map((p) => [p.name, p]));
  let activeCategory = "all";
  const cartState = new Map();

  const getTotalCartItems = () => Array.from(cartState.values())
    .reduce((total, item) => total + item.qty, 0);

  const setCartButtonsState = () => {
    if (!clearCartBtn || !buyCartBtn) return;
    const hasItems = cartState.size > 0;
    clearCartBtn.disabled = !hasItems;
    buyCartBtn.disabled = !hasItems;
  };

  const renderCart = () => {
    if (!isCatalogPage || !cartItems || !cartCount) return;

    const totalItems = getTotalCartItems();
    cartCount.textContent = `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`;

    if (cartState.size === 0) {
      cartItems.innerHTML = `<p class="text-[#6b6b6b]">Aún no agregas productos.</p>`;
      setCartButtonsState();
      return;
    }

    cartItems.innerHTML = Array.from(cartState.values()).map((item) => `
      <div class="flex items-center justify-between gap-3 rounded-xl border border-[#e8e8e8] bg-white px-3 py-2.5 max-[640px]:flex-col max-[640px]:items-start">
        <div>
          <strong>${item.name}</strong>
          <p class="m-[.15rem_0_0] text-sm text-[#6b6b6b]">${item.category}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="min-w-[34px] cursor-pointer rounded-[10px] border border-[#e8e8e8] bg-white px-2 py-1 font-extrabold" type="button" data-cart-action="decrease" data-cart-product="${item.name}" aria-label="Quitar una unidad">-</button>
          <span class="min-w-[20px] text-center font-extrabold">${item.qty}</span>
          <button class="min-w-[34px] cursor-pointer rounded-[10px] border border-[#e8e8e8] bg-white px-2 py-1 font-extrabold" type="button" data-cart-action="increase" data-cart-product="${item.name}" aria-label="Agregar una unidad">+</button>
          <button class="cursor-pointer rounded-[10px] border border-[#e8e8e8] bg-white px-2 py-1 text-sm font-extrabold text-[#6b6b6b]" type="button" data-cart-action="remove" data-cart-product="${item.name}">Quitar</button>
        </div>
      </div>
    `).join("");

    setCartButtonsState();
  };

  const addToCart = (productName) => {
    if (!productName) return;
    const product = productByName.get(productName);
    if (!product) return;
    if (product.stockStatus === "agotado") return;

    const current = cartState.get(productName);
    if (current) {
      current.qty += 1;
    } else {
      cartState.set(productName, { name: product.name, category: product.category, qty: 1 });
    }
    renderCart();
  };

  const updateCartItem = (productName, action) => {
    const current = cartState.get(productName);
    if (!current) return;

    if (action === "increase") {
      current.qty += 1;
    } else if (action === "decrease") {
      current.qty -= 1;
      if (current.qty <= 0) cartState.delete(productName);
    } else if (action === "remove") {
      cartState.delete(productName);
    }

    renderCart();
  };

  const sendCartToWhatsApp = () => {
    if (!cartState.size) {
      buyCartBtn?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const lines = Array.from(cartState.values()).map((item, i) =>
      `${i + 1}. ${item.name} x${item.qty}`
    );

    const msg = [
      "Hola, quiero hacer esta compra en Kairos Lab:",
      "",
      ...lines,
      "",
      `Total de unidades: ${getTotalCartItems()}.`,
      "¿Me confirman disponibilidad y forma de pago?"
    ].join("\n");

    window.open(buildWhatsAppLink(msg), "_blank", "noopener");
  };

  const renderCategoryFilters = () => {
    if (!categoryFilters) return;

    const options = [{ label: "Todos", value: "all" }].concat(
      categories.map((category) => ({ label: category, value: category }))
    );

    const chipBase = "rounded-full border px-3 py-1.5 font-bold transition-all duration-200 whitespace-nowrap";
    const chipActive = "border-[#111] bg-[#111] text-white";
    const chipIdle = "border-[#e8e8e8] bg-white text-[#6b6b6b] hover:border-[#cecece] hover:text-[#111]";

    categoryFilters.innerHTML = options.map((option) => `
      <button
        class="${chipBase} ${option.value === activeCategory ? chipActive : chipIdle}"
        type="button"
        data-category="${option.value}"
        aria-pressed="${option.value === activeCategory ? "true" : "false"}"
      >
        ${option.label}
      </button>
    `).join("");
  };

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    const filtered = storefrontProducts.filter((p) => {
      const matchesSearch = `${p.name} ${p.category} ${p.desc}`
        .toLowerCase()
        .includes(q);
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    renderProducts(filtered);
  };

  input.addEventListener("input", apply);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    activeCategory = "all";
    renderCategoryFilters();
    apply();
  });

  categoryFilters?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-category]");
    if (!btn) return;
    activeCategory = btn.getAttribute("data-category") || "all";
    renderCategoryFilters();
    apply();
  });

  grid.addEventListener("click", (e) => {
    const addBtn = e.target.closest("button[data-add-product]");
    if (addBtn && isCatalogPage) {
      addToCart(addBtn.getAttribute("data-add-product"));
      return;
    }

    const btn = e.target.closest("button[data-product]");
    if (!btn) return;

    const productName = btn.getAttribute("data-product");
    const msg = `Hola, quiero información del producto "${productName}" (Kairos Lab). ¿Precio y disponibilidad?`;
    window.open(buildWhatsAppLink(msg), "_blank", "noopener");
  });

  cartItems?.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("button[data-cart-action]");
    if (!actionBtn) return;

    const productName = actionBtn.getAttribute("data-cart-product") || "";
    const action = actionBtn.getAttribute("data-cart-action") || "";
    updateCartItem(productName, action);
  });

  clearCartBtn?.addEventListener("click", () => {
    cartState.clear();
    renderCart();
  });

  buyCartBtn?.addEventListener("click", sendCartToWhatsApp);
  floatBuyBtn?.addEventListener("click", (e) => {
    if (!isCatalogPage) return;
    e.preventDefault();
    sendCartToWhatsApp();
  });

  if (isCatalogPage && floatBuyBtn && buyCartBtn) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldShow = !entry.isIntersecting;
        setFloatHidden(floatBuyBtn, !shouldShow);
      },
      { threshold: 0.2 }
    );
    observer.observe(buyCartBtn);
  }

  renderCategoryFilters();
  renderCart();
  apply();
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

function initHomeFloatingCtaVisibility() {
  if (isCatalogPage) return;

  const floatCta = document.getElementById("floatCta");
  const heroWhatsAppBtn = document.getElementById("btnCitaHero");
  const quickFormSubmitBtn = document.querySelector("#quickForm button[type='submit']");

  if (!floatCta || !heroWhatsAppBtn || !quickFormSubmitBtn) return;

  const visibility = new Map([
    [heroWhatsAppBtn, false],
    [quickFormSubmitBtn, false],
  ]);

  const updateFloatVisibility = () => {
    const anyPrimaryButtonVisible = Array.from(visibility.values()).some(Boolean);
    setFloatHidden(floatCta, anyPrimaryButtonVisible);
  };

  setFloatHidden(floatCta, true);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibility.set(entry.target, entry.isIntersecting);
      });
      updateFloatVisibility();
    },
    { threshold: 0.2 }
  );

  observer.observe(heroWhatsAppBtn);
  observer.observe(quickFormSubmitBtn);
}

function initDeferredMap() {
  const frame = document.querySelector("#ubicacion iframe[data-src]");
  if (!frame) return;

  const loadMap = () => {
    if (!frame.getAttribute("src")) {
      frame.setAttribute("src", frame.dataset.src || "");
    }
  };

  if (!("IntersectionObserver" in window)) {
    loadMap();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, current) => {
      if (!entries[0]?.isIntersecting) return;
      loadMap();
      current.disconnect();
    },
    { rootMargin: "250px 0px" }
  );

  observer.observe(frame);
}

setCtaLinks();
renderServices();
initSearch();
initMobileNav();
initQuickForm();
initYear();
initHomeFloatingCtaVisibility();
initDeferredMap();
