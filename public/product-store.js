(() => {
  const STORAGE_KEY = "kairos_products_v1";
  const HISTORY_KEY = "kairos_products_history_v1";

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "producto";
  }

  function ensureId(product, index) {
    if (product.id && String(product.id).trim()) return String(product.id);
    const base = slugify(product.name || `producto-${index + 1}`);
    return `${base}-${index + 1}`;
  }

  function normalizeProduct(product, index) {
    const normalized = { ...product };
    normalized.id = ensureId(normalized, index);
    normalized.name = String(normalized.name || "").trim();
    normalized.category = String(normalized.category || "").trim();
    normalized.desc = String(normalized.desc || "").trim();
    normalized.price = String(normalized.price || "").trim();
    normalized.image = String(normalized.image || "").trim();
    normalized.visible = normalized.visible !== false;
    normalized.enabled = normalized.enabled !== false;
    normalized.stockStatus = normalized.stockStatus === "agotado" ? "agotado" : "disponible";
    return normalized;
  }

  function normalizeProducts(list) {
    const raw = Array.isArray(list) ? list : [];
    const normalized = raw.map((product, index) => normalizeProduct(product, index));

    const used = new Set();
    return normalized.map((product, index) => {
      let nextId = product.id;
      if (used.has(nextId)) {
        nextId = `${slugify(product.name || "producto")}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`;
      }
      used.add(nextId);
      return { ...product, id: nextId };
    });
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors in restricted environments.
    }
  }

  function readProducts(defaultProducts) {
    const parsed = readJSON(STORAGE_KEY, null);
    if (!Array.isArray(parsed)) return normalizeProducts(defaultProducts);
    return normalizeProducts(parsed);
  }

  function saveProducts(products) {
    const normalized = normalizeProducts(products);
    writeJSON(STORAGE_KEY, normalized);
    return normalized;
  }

  function resetProducts(defaultProducts) {
    const normalized = normalizeProducts(defaultProducts);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors in restricted environments.
    }
    return normalized;
  }

  function getHistory() {
    const parsed = readJSON(HISTORY_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function addHistory(entry) {
    const next = {
      timestamp: new Date().toISOString(),
      user: entry?.user || "admin",
      action: entry?.action || "update",
      productId: entry?.productId || "",
      productName: entry?.productName || "",
      details: entry?.details || "",
    };
    const history = getHistory();
    history.unshift(next);
    writeJSON(HISTORY_KEY, history.slice(0, 200));
    return next;
  }

  function clearHistory() {
    writeJSON(HISTORY_KEY, []);
  }

  window.KairosStore = {
    STORAGE_KEY,
    HISTORY_KEY,
    normalizeProducts,
    getProducts(defaultProducts) {
      return readProducts(defaultProducts);
    },
    saveProducts,
    resetProducts,
    getHistory,
    addHistory,
    clearHistory,
  };
})();
