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
          ${isCatalogPage ? `<button class="btn btn--primary" data-add-product="${p.name}">Agregar al carrito</button>` : ""}
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
  const categoryFilters = document.getElementById("categoryFilters");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const clearCartBtn = document.getElementById("clearCart");
  const buyCartBtn = document.getElementById("buyCart");
  const floatBuyBtn = document.getElementById("floatCta");

  if (!input || !clearBtn || !grid) return;

  const categories = Array.from(
    new Set(visibleProducts.map((p) => p.category).filter(Boolean))
  );
  const productByName = new Map(visibleProducts.map((p) => [p.name, p]));
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
      cartItems.innerHTML = `<p class="muted">Aún no agregas productos.</p>`;
      setCartButtonsState();
      return;
    }

    cartItems.innerHTML = Array.from(cartState.values()).map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p class="muted">${item.category}</p>
        </div>
        <div class="cart-item__controls">
          <button class="cart-qty-btn" type="button" data-cart-action="decrease" data-cart-product="${item.name}" aria-label="Quitar una unidad">-</button>
          <span class="cart-qty">${item.qty}</span>
          <button class="cart-qty-btn" type="button" data-cart-action="increase" data-cart-product="${item.name}" aria-label="Agregar una unidad">+</button>
          <button class="cart-remove-btn" type="button" data-cart-action="remove" data-cart-product="${item.name}">Quitar</button>
        </div>
      </div>
    `).join("");

    setCartButtonsState();
  };

  const addToCart = (productName) => {
    if (!productName) return;
    const product = productByName.get(productName);
    if (!product) return;

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

    categoryFilters.innerHTML = options.map((option) => `
      <button
        class="filter-chip${option.value === activeCategory ? " is-active" : ""}"
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
    const filtered = visibleProducts.filter((p) => {
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
        floatBuyBtn.classList.toggle("float-cta--hidden", !shouldShow);
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
    floatCta.classList.toggle("float-cta--hidden", anyPrimaryButtonVisible);
  };

  floatCta.classList.add("float-cta--hidden");

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

setCtaLinks();
renderServices();
initSearch();
initMobileNav();
initQuickForm();
initYear();
initHomeFloatingCtaVisibility();
