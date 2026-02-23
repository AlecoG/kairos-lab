(() => {
  const AUTH_KEY = "kairos_admin_session";
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "kairos123";

  const base = document.body?.dataset?.base || "/";
  const baseUrl = base.endsWith("/") ? base : `${base}/`;

  function redirect(path) {
    window.location.href = `${baseUrl}${path.replace(/^\/+/, "")}`;
  }

  function normalizeProducts(source) {
    if (window.KairosStore?.normalizeProducts) {
      return window.KairosStore.normalizeProducts(source);
    }
    return Array.isArray(source) ? source : [];
  }

  function loadProducts() {
    const seed = window.KAIROS_PRODUCTS || [];
    if (window.KairosStore?.getProducts) return window.KairosStore.getProducts(seed);
    return normalizeProducts(seed);
  }

  function saveProducts(products) {
    if (window.KairosStore?.saveProducts) return window.KairosStore.saveProducts(products);
    return normalizeProducts(products);
  }

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function requireLogin() {
    if (!isLoggedIn()) {
      redirect("admin/login/");
      return false;
    }
    return true;
  }

  function initLoginPage() {
    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    if (isLoggedIn()) {
      redirect("admin/panel/");
      return;
    }

    const userInput = document.getElementById("adminUser");
    const passwordInput = document.getElementById("adminPass");
    const errorBox = document.getElementById("adminLoginError");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = userInput?.value?.trim() || "";
      const pass = passwordInput?.value?.trim() || "";

      if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, "1");
        redirect("admin/panel/");
        return;
      }

      if (errorBox) {
        errorBox.textContent = "Usuario o contraseña incorrectos.";
        errorBox.classList.remove("hidden");
      }
    });
  }

  function getStats(products) {
    const total = products.length;
    const visible = products.filter((p) => p.visible !== false && p.enabled !== false).length;
    const hiddenOrDisabled = products.filter((p) => p.visible === false || p.enabled === false).length;
    const visibleOutOfStock = products.filter((p) => p.visible !== false && p.enabled !== false && p.stockStatus === "agotado").length;
    return { total, visible, hiddenOrDisabled, visibleOutOfStock };
  }

  function statCard(title, value, tone) {
    const tones = {
      default: "border-[#e8e8e8] bg-white text-[#111111]",
      success: "border-emerald-200 bg-emerald-50 text-emerald-800",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
      danger: "border-red-200 bg-red-50 text-red-800",
    };
    return `
      <article class="rounded-2xl border p-4 ${tones[tone] || tones.default}">
        <p class="m-0 text-sm font-semibold opacity-80">${title}</p>
        <p class="mt-2 text-3xl font-black">${value}</p>
      </article>
    `;
  }

  function renderStats(products) {
    const root = document.getElementById("adminStats");
    if (!root) return;

    const stats = getStats(products);
    root.innerHTML = [
      statCard("Productos existentes", stats.total, "default"),
      statCard("Productos visibles", stats.visible, "success"),
      statCard("No visibles / deshabilitados", stats.hiddenOrDisabled, "warning"),
      statCard("Visibles en agotado", stats.visibleOutOfStock, "danger"),
    ].join("");
  }

  function productRow(product, index) {
    const visible = product.visible !== false;
    const enabled = product.enabled !== false;
    const statusColor = product.stockStatus === "agotado"
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";

    return `
      <tr class="border-t border-[#e8e8e8]">
        <td class="px-3 py-3 font-semibold">${product.name}</td>
        <td class="px-3 py-3 text-sm text-[#6b6b6b]">${product.category}</td>
        <td class="px-3 py-3 text-sm">${product.price}</td>
        <td class="px-3 py-3">
          <span class="rounded-full px-2 py-1 text-xs font-bold ${visible ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"}">${visible ? "Visible" : "No visible"}</span>
        </td>
        <td class="px-3 py-3">
          <span class="rounded-full px-2 py-1 text-xs font-bold ${enabled ? "bg-blue-100 text-blue-700" : "bg-zinc-200 text-zinc-700"}">${enabled ? "Habilitado" : "Deshabilitado"}</span>
        </td>
        <td class="px-3 py-3">
          <span class="rounded-full px-2 py-1 text-xs font-bold ${statusColor}">${product.stockStatus === "agotado" ? "Agotado" : "Disponible"}</span>
        </td>
        <td class="px-3 py-3 text-right">
          <button type="button" class="rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm font-bold" data-edit-index="${index}">Editar</button>
        </td>
      </tr>
    `;
  }

  function renderProductsTable(products) {
    const tableBody = document.getElementById("adminProductsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = products.map((product, index) => productRow(product, index)).join("");
  }

  function setEditForm(product, index) {
    const indexField = document.getElementById("editIndex");
    const nameField = document.getElementById("editName");
    const categoryField = document.getElementById("editCategory");
    const priceField = document.getElementById("editPrice");
    const visibleField = document.getElementById("editVisible");
    const enabledField = document.getElementById("editEnabled");
    const stockField = document.getElementById("editStockStatus");

    if (!indexField || !nameField || !categoryField || !priceField || !visibleField || !enabledField || !stockField) return;

    indexField.value = String(index);
    nameField.value = product.name || "";
    categoryField.value = product.category || "";
    priceField.value = product.price || "";
    visibleField.checked = product.visible !== false;
    enabledField.checked = product.enabled !== false;
    stockField.value = product.stockStatus === "agotado" ? "agotado" : "disponible";
  }

  function initPanelPage() {
    const panel = document.getElementById("adminPanel");
    if (!panel) return;
    if (!requireLogin()) return;

    const logoutBtn = document.getElementById("adminLogoutBtn");
    const modal = document.getElementById("editProductModal");
    const closeModalBtn = document.getElementById("closeEditModal");
    const editForm = document.getElementById("editProductForm");

    let products = loadProducts();

    const repaint = () => {
      renderStats(products);
      renderProductsTable(products);
    };

    repaint();

    logoutBtn?.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      redirect("admin/login/");
    });

    panel.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-edit-index]");
      if (!button) return;
      const index = Number(button.getAttribute("data-edit-index"));
      const product = products[index];
      if (!product) return;

      setEditForm(product, index);
      modal?.classList.remove("hidden");
      modal?.classList.add("flex");
    });

    const closeModal = () => {
      modal?.classList.remove("flex");
      modal?.classList.add("hidden");
    };

    closeModalBtn?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    editForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const index = Number(document.getElementById("editIndex")?.value ?? "-1");
      if (!products[index]) return;

      const next = { ...products[index] };
      next.name = document.getElementById("editName")?.value?.trim() || next.name;
      next.category = document.getElementById("editCategory")?.value?.trim() || next.category;
      next.price = document.getElementById("editPrice")?.value?.trim() || next.price;
      next.visible = !!document.getElementById("editVisible")?.checked;
      next.enabled = !!document.getElementById("editEnabled")?.checked;
      next.stockStatus = document.getElementById("editStockStatus")?.value === "agotado" ? "agotado" : "disponible";

      products[index] = next;
      products = saveProducts(products);
      repaint();
      closeModal();
    });
  }

  initLoginPage();
  initPanelPage();
})();
