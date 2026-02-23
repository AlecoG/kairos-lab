(() => {
  const STORAGE_KEY = "kairos_products_v1";

  function normalizeProduct(product) {
    const normalized = { ...product };
    normalized.visible = normalized.visible !== false;
    normalized.enabled = normalized.enabled !== false;
    normalized.stockStatus = normalized.stockStatus === "agotado" ? "agotado" : "disponible";
    return normalized;
  }

  function normalizeProducts(list) {
    return (Array.isArray(list) ? list : []).map(normalizeProduct);
  }

  function readProducts(defaultProducts) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return normalizeProducts(defaultProducts);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return normalizeProducts(defaultProducts);
      return normalizeProducts(parsed);
    } catch {
      return normalizeProducts(defaultProducts);
    }
  }

  function saveProducts(products) {
    const normalized = normalizeProducts(products);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage errors in restricted environments.
    }
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

  window.KairosStore = {
    STORAGE_KEY,
    normalizeProducts,
    getProducts(defaultProducts) {
      return readProducts(defaultProducts);
    },
    saveProducts,
    resetProducts,
  };
})();
