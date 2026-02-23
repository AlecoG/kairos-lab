(() => {
  const AUTH_KEY = "kairos_admin_session";
  const USER_KEY = "kairos_admin_user";
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "kairos123";

  const base = document.body?.dataset?.base || "/";
  const baseUrl = base.endsWith("/") ? base : `${base}/`;

  function redirect(path) {
    window.location.href = `${baseUrl}${path.replace(/^\/+/, "")}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "producto";
  }

  function createProductId(name) {
    return `${slugify(name)}-${Date.now().toString(36)}`;
  }

  function normalizeProducts(source) {
    if (window.KairosStore?.normalizeProducts) return window.KairosStore.normalizeProducts(source);
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

  function getHistory() {
    return window.KairosStore?.getHistory ? window.KairosStore.getHistory() : [];
  }

  function getCurrentUser() {
    return sessionStorage.getItem(USER_KEY) || ADMIN_USER;
  }

  function addAudit(action, product, details = "") {
    if (!window.KairosStore?.addHistory) return;
    window.KairosStore.addHistory({
      user: getCurrentUser(),
      action,
      productId: product?.id || "",
      productName: product?.name || "",
      details,
    });
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
        sessionStorage.setItem(USER_KEY, user);
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

  function productRow(product) {
    const visible = product.visible !== false;
    const enabled = product.enabled !== false;
    const statusColor = product.stockStatus === "agotado"
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";

    return `
      <tr class="border-t border-[#e8e8e8]">
        <td class="px-3 py-3 font-semibold">${escapeHtml(product.name)}</td>
        <td class="px-3 py-3 text-sm text-[#6b6b6b]">${escapeHtml(product.category)}</td>
        <td class="px-3 py-3 text-sm">${escapeHtml(product.price)}</td>
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
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm font-bold" data-edit-id="${escapeHtml(product.id)}">Editar</button>
            <button type="button" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700" data-delete-id="${escapeHtml(product.id)}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderProductsTable(products) {
    const tableBody = document.getElementById("adminProductsTableBody");
    if (!tableBody) return;

    if (!products.length) {
      tableBody.innerHTML = `
        <tr class="border-t border-[#e8e8e8]">
          <td colspan="7" class="px-3 py-6 text-center text-sm text-[#6b6b6b]">No hay productos que coincidan con los filtros.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = products.map((product) => productRow(product)).join("");
  }

  function renderHistory() {
    const list = document.getElementById("adminHistoryList");
    if (!list) return;

    const history = getHistory();
    if (!history.length) {
      list.innerHTML = `<li class="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 text-sm text-[#6b6b6b]">Aún no hay cambios registrados.</li>`;
      return;
    }

    list.innerHTML = history.map((item) => {
      const time = new Date(item.timestamp || Date.now()).toLocaleString();
      return `
        <li class="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 text-sm">
          <p class="m-0 font-semibold">${escapeHtml(item.action || "update")} · ${escapeHtml(item.productName || "Producto")}</p>
          <p class="m-1 text-xs text-[#6b6b6b]">${escapeHtml(item.user || "admin")} · ${escapeHtml(time)}</p>
          ${item.details ? `<p class="m-0 text-xs text-[#6b6b6b]">${escapeHtml(item.details)}</p>` : ""}
        </li>
      `;
    }).join("");
  }

  function matchesFilter(product, filter) {
    if (filter === "visible") return product.visible !== false && product.enabled !== false;
    if (filter === "agotado") return product.stockStatus === "agotado";
    if (filter === "disabled") return product.visible === false || product.enabled === false;
    return true;
  }

  function initPanelPage() {
    const panel = document.getElementById("adminPanel");
    if (!panel) return;
    if (!requireLogin()) return;

    const logoutBtn = document.getElementById("adminLogoutBtn");
    const searchInput = document.getElementById("adminSearch");
    const stateFilter = document.getElementById("adminStateFilter");
    const createBtn = document.getElementById("adminCreateBtn");
    const exportBtn = document.getElementById("adminExportBtn");
    const importBtn = document.getElementById("adminImportBtn");
    const importInput = document.getElementById("adminImportInput");
    const clearHistoryBtn = document.getElementById("adminClearHistoryBtn");

    const modal = document.getElementById("editProductModal");
    const modalTitle = document.getElementById("editModalTitle");
    const closeModalBtn = document.getElementById("closeEditModal");
    const deleteProductBtn = document.getElementById("deleteProductBtn");
    const editForm = document.getElementById("editProductForm");

    const idField = document.getElementById("editIndex");
    const nameField = document.getElementById("editName");
    const descField = document.getElementById("editDesc");
    const categoryField = document.getElementById("editCategory");
    const priceField = document.getElementById("editPrice");
    const visibleField = document.getElementById("editVisible");
    const enabledField = document.getElementById("editEnabled");
    const stockField = document.getElementById("editStockStatus");
    const imageField = document.getElementById("editImage");
    const imageFileField = document.getElementById("editImageFile");
    const imagePreview = document.getElementById("editImagePreview");

    let products = loadProducts();
    let mode = "edit";
    let activeId = null;

    const updateImagePreview = (value) => {
      if (!imagePreview) return;
      if (!value) {
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
        return;
      }
      imagePreview.src = value;
      imagePreview.classList.remove("hidden");
    };

    const repaint = () => {
      const query = String(searchInput?.value || "").toLowerCase().trim();
      const filter = String(stateFilter?.value || "all");

      const filtered = products.filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.desc}`.toLowerCase();
        const searchOk = !query || haystack.includes(query);
        const filterOk = matchesFilter(product, filter);
        return searchOk && filterOk;
      });

      renderStats(products);
      renderProductsTable(filtered);
      renderHistory();
    };

    const openModal = (nextMode, product) => {
      mode = nextMode;
      activeId = product?.id || null;

      if (modalTitle) modalTitle.textContent = nextMode === "create" ? "Crear producto" : "Editar producto";
      if (deleteProductBtn) deleteProductBtn.classList.toggle("hidden", nextMode === "create");

      if (idField) idField.value = product?.id || "";
      if (nameField) nameField.value = product?.name || "";
      if (descField) descField.value = product?.desc || "";
      if (categoryField) categoryField.value = product?.category || "";
      if (priceField) priceField.value = product?.price || "";
      if (visibleField) visibleField.checked = product?.visible !== false;
      if (enabledField) enabledField.checked = product?.enabled !== false;
      if (stockField) stockField.value = product?.stockStatus === "agotado" ? "agotado" : "disponible";
      if (imageField) imageField.value = product?.image || "";
      if (imageFileField) imageFileField.value = "";
      updateImagePreview(product?.image || "");

      modal?.classList.remove("hidden");
      modal?.classList.add("flex");
    };

    const closeModal = () => {
      modal?.classList.remove("flex");
      modal?.classList.add("hidden");
      activeId = null;
      mode = "edit";
    };

    const persistProducts = (nextProducts, auditAction, product, details = "") => {
      products = saveProducts(nextProducts);
      addAudit(auditAction, product, details);
      repaint();
    };

    repaint();

    logoutBtn?.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(USER_KEY);
      redirect("admin/login/");
    });

    searchInput?.addEventListener("input", repaint);
    stateFilter?.addEventListener("change", repaint);

    createBtn?.addEventListener("click", () => {
      openModal("create", {
        name: "",
        desc: "",
        category: "",
        price: "",
        visible: true,
        enabled: true,
        stockStatus: "disponible",
        image: "",
      });
    });

    panel.addEventListener("click", (event) => {
      const editButton = event.target.closest("button[data-edit-id]");
      if (editButton) {
        const id = editButton.getAttribute("data-edit-id") || "";
        const product = products.find((item) => item.id === id);
        if (product) openModal("edit", product);
        return;
      }

      const deleteButton = event.target.closest("button[data-delete-id]");
      if (deleteButton) {
        const id = deleteButton.getAttribute("data-delete-id") || "";
        const product = products.find((item) => item.id === id);
        if (!product) return;
        if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
        persistProducts(products.filter((item) => item.id !== id), "delete", product);
      }
    });

    closeModalBtn?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    imageField?.addEventListener("input", () => {
      updateImagePreview(imageField.value.trim());
    });

    imageFileField?.addEventListener("change", () => {
      const file = imageFileField.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        if (imageField) imageField.value = result;
        updateImagePreview(result);
      };
      reader.readAsDataURL(file);
    });

    deleteProductBtn?.addEventListener("click", () => {
      if (!activeId) return;
      const product = products.find((item) => item.id === activeId);
      if (!product) return;
      if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
      persistProducts(products.filter((item) => item.id !== activeId), "delete", product);
      closeModal();
    });

    editForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const next = {
        id: activeId || createProductId(nameField?.value || ""),
        name: nameField?.value?.trim() || "",
        desc: descField?.value?.trim() || "",
        category: categoryField?.value?.trim() || "",
        price: priceField?.value?.trim() || "",
        visible: !!visibleField?.checked,
        enabled: !!enabledField?.checked,
        stockStatus: stockField?.value === "agotado" ? "agotado" : "disponible",
        image: imageField?.value?.trim() || "",
      };

      if (!next.name || !next.category || !next.price || !next.desc) return;

      if (mode === "create") {
        persistProducts([next, ...products], "create", next);
      } else {
        const exists = products.some((item) => item.id === next.id);
        if (!exists) return;
        persistProducts(products.map((item) => (item.id === next.id ? { ...item, ...next } : item)), "update", next);
      }

      closeModal();
    });

    exportBtn?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kairos-products-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });

    importBtn?.addEventListener("click", () => {
      importInput?.click();
    });

    importInput?.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          window.alert("El archivo JSON debe contener un arreglo de productos.");
          return;
        }
        const normalized = normalizeProducts(parsed);
        products = saveProducts(normalized);
        addAudit("import", { name: "Importación", id: "bulk-import" }, `Archivo: ${file.name}`);
        repaint();
      } catch {
        window.alert("No se pudo importar el archivo JSON.");
      } finally {
        importInput.value = "";
      }
    });

    clearHistoryBtn?.addEventListener("click", () => {
      if (!window.confirm("¿Limpiar historial de cambios?")) return;
      window.KairosStore?.clearHistory?.();
      repaint();
    });
  }

  initLoginPage();
  initPanelPage();
})();
