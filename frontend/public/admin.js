(() => {
  const AUTH_TOKEN_KEY = "kairos_admin_token";
  const USER_KEY = "kairos_admin_user";

  const base = document.body?.dataset?.base || "/";
  const baseUrl = base.endsWith("/") ? base : `${base}/`;
  const apiBase = (document.body?.dataset?.apiBase || "http://127.0.0.1:8000").replace(/\/$/, "");

  const historyState = [];

  function redirect(path) {
    window.location.href = `${baseUrl}${path.replace(/^\/+/, "")}`;
  }

  function getAuthToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
  }

  function getCurrentUser() {
    return sessionStorage.getItem(USER_KEY) || "admin";
  }

  function isLoggedIn() {
    return Boolean(getAuthToken());
  }

  function clearSession() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  function requireLogin() {
    if (!isLoggedIn()) {
      redirect("admin/login/");
      return false;
    }
    return true;
  }

  async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) return null;

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = payload?.detail || "Error de API";
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function loginApi(username, password) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
  }

  async function fetchProductsAdmin() {
    return apiRequest("/products?include_hidden=true");
  }

  async function createProductApi(product) {
    return apiRequest("/admin/products", { method: "POST", body: product, auth: true });
  }

  async function updateProductApi(productId, patch) {
    return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
      method: "PUT",
      body: patch,
      auth: true,
    });
  }

  async function deleteProductApi(productId) {
    return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      auth: true,
    });
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

  function addAudit(action, product, details = "") {
    historyState.unshift({
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action,
      productId: product?.id || "",
      productName: product?.name || "",
      details,
    });
    if (historyState.length > 300) historyState.length = 300;
  }

  function getStats(products) {
    const total = products.length;
    const visible = products.filter((p) => p.visible !== false && p.enabled !== false).length;
    const hiddenOrDisabled = products.filter((p) => p.visible === false || p.enabled === false).length;
    const visibleOutOfStock = products.filter((p) => p.visible !== false && p.enabled !== false && p.stock_status === "agotado").length;
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
    const statusColor = product.stock_status === "agotado"
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
          <span class="rounded-full px-2 py-1 text-xs font-bold ${statusColor}">${product.stock_status === "agotado" ? "Agotado" : "Disponible"}</span>
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

    if (!historyState.length) {
      list.innerHTML = `<li class="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 text-sm text-[#6b6b6b]">Aún no hay cambios registrados.</li>`;
      return;
    }

    list.innerHTML = historyState.map((item) => {
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
    if (filter === "agotado") return product.stock_status === "agotado";
    if (filter === "disabled") return product.visible === false || product.enabled === false;
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

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const user = userInput?.value?.trim() || "";
      const pass = passwordInput?.value?.trim() || "";

      try {
        const response = await loginApi(user, pass);
        sessionStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
        sessionStorage.setItem(USER_KEY, user);
        redirect("admin/panel/");
      } catch {
        if (errorBox) {
          errorBox.textContent = "Usuario o contraseña incorrectos.";
          errorBox.classList.remove("hidden");
        }
      }
    });
  }

  async function initPanelPage() {
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

    let products = [];
    let mode = "edit";
    let activeId = null;

    try {
      products = await fetchProductsAdmin();
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
        redirect("admin/login/");
        return;
      }
      window.alert("No se pudieron cargar los productos desde la API.");
      return;
    }

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
      if (stockField) stockField.value = product?.stock_status === "agotado" ? "agotado" : "disponible";
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

    repaint();

    logoutBtn?.addEventListener("click", () => {
      clearSession();
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
        stock_status: "disponible",
        image: "",
      });
    });

    panel.addEventListener("click", async (event) => {
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

        try {
          await deleteProductApi(id);
          products = products.filter((item) => item.id !== id);
          addAudit("delete", product);
          repaint();
        } catch (error) {
          if (error?.status === 401) {
            clearSession();
            redirect("admin/login/");
            return;
          }
          window.alert("No se pudo eliminar el producto.");
        }
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

    deleteProductBtn?.addEventListener("click", async () => {
      if (!activeId) return;
      const product = products.find((item) => item.id === activeId);
      if (!product) return;
      if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;

      try {
        await deleteProductApi(activeId);
        products = products.filter((item) => item.id !== activeId);
        addAudit("delete", product);
        repaint();
        closeModal();
      } catch (error) {
        if (error?.status === 401) {
          clearSession();
          redirect("admin/login/");
          return;
        }
        window.alert("No se pudo eliminar el producto.");
      }
    });

    editForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const next = {
        id: activeId || createProductId(nameField?.value || ""),
        name: nameField?.value?.trim() || "",
        desc: descField?.value?.trim() || "",
        category: categoryField?.value?.trim() || "",
        price: priceField?.value?.trim() || "",
        visible: !!visibleField?.checked,
        enabled: !!enabledField?.checked,
        stock_status: stockField?.value === "agotado" ? "agotado" : "disponible",
        image: imageField?.value?.trim() || "",
      };

      if (!next.name || !next.category || !next.price || !next.desc) return;

      try {
        if (mode === "create") {
          const created = await createProductApi(next);
          products = [created, ...products];
          addAudit("create", created);
        } else {
          const updated = await updateProductApi(next.id, {
            name: next.name,
            desc: next.desc,
            category: next.category,
            price: next.price,
            visible: next.visible,
            enabled: next.enabled,
            stock_status: next.stock_status,
            image: next.image,
          });
          products = products.map((item) => (item.id === updated.id ? updated : item));
          addAudit("update", updated);
        }

        repaint();
        closeModal();
      } catch (error) {
        if (error?.status === 401) {
          clearSession();
          redirect("admin/login/");
          return;
        }
        if (error?.status === 409) {
          window.alert("El id del producto ya existe. Cambia el nombre o id.");
          return;
        }
        window.alert("No se pudo guardar el producto.");
      }
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

        const byId = new Map(products.map((p) => [p.id, p]));
        for (const raw of parsed) {
          const payload = {
            id: raw.id || createProductId(raw.name || "producto"),
            name: String(raw.name || "").trim(),
            desc: String(raw.desc || "").trim(),
            category: String(raw.category || "").trim(),
            price: String(raw.price || "").trim(),
            image: String(raw.image || "").trim(),
            visible: raw.visible !== false,
            enabled: raw.enabled !== false,
            stock_status: raw.stock_status === "agotado" ? "agotado" : "disponible",
          };

          if (!payload.name || !payload.category || !payload.price || !payload.desc) continue;

          if (byId.has(payload.id)) {
            const updated = await updateProductApi(payload.id, payload);
            byId.set(updated.id, updated);
          } else {
            const created = await createProductApi(payload);
            byId.set(created.id, created);
          }
        }

        products = Array.from(byId.values());
        addAudit("import", { id: "bulk-import", name: "Importación" }, `Archivo: ${file.name}`);
        repaint();
      } catch (error) {
        if (error?.status === 401) {
          clearSession();
          redirect("admin/login/");
          return;
        }
        window.alert("No se pudo importar el archivo JSON.");
      } finally {
        importInput.value = "";
      }
    });

    clearHistoryBtn?.addEventListener("click", () => {
      if (!window.confirm("¿Limpiar historial de cambios?")) return;
      historyState.length = 0;
      repaint();
    });
  }

  initLoginPage();
  initPanelPage();
})();
