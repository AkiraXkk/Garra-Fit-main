const DEFAULT_IMAGE =
  "https://github.com/user-attachments/assets/e77df1c0-444c-499e-93e8-8320e75c16a0";

const FALLBACK_PRODUCTS = [
  {
    id: "whey-900",
    name: "Whey Protein 900g",
    category: "suplementos",
    description: "Blend proteico para recuperacao muscular e ganho de massa.",
    price: 135,
    stock: 11,
    featured: 1,
    image: DEFAULT_IMAGE,
  },
  {
    id: "creatina-300",
    name: "Creatina Monohidratada 300g",
    category: "suplementos",
    description: "Potencia e resistencia para treinos intensos.",
    price: 89.9,
    stock: 16,
    featured: 2,
    image: DEFAULT_IMAGE,
  },
  {
    id: "pre-treino",
    name: "Pre-Treino Insano 300g",
    category: "suplementos",
    description: "Foco e energia para iniciar o treino no maximo.",
    price: 78,
    stock: 9,
    featured: 3,
    image: DEFAULT_IMAGE,
  },
];

const STORAGE_KEY = "garra-fit-store-v2";
const ADMIN_STORAGE_KEY = "garra-fit-admin-v1";
const FREE_SHIPPING_THRESHOLD = 159;
const WHATSAPP_NUMBER = "5516981855932";
const DEFAULT_ADMIN_PASSWORD = "GarraFit#2026!";
const INITIAL_SHIPPING_STATE = {
  price: 0,
  region: "",
  message: "Informe o CEP para simular entrega.",
};
const PRODUCT_REFRESH_INTERVAL = 30000;

const defaultStoreState = () => ({
  cart: {},
  favorites: [],
  coupon: null,
  cep: "",
  payment: "pix",
  shipping: { ...INITIAL_SHIPPING_STATE },
});

const categoryLabel = {
  suplementos: "Suplementos",
  combos: "Combos",
  acessorios: "Acessorios",
};

const state = {
  products: [],
  search: "",
  category: "all",
  sort: "featured",
  favoriteOnly: false,
  ...defaultStoreState(),
  admin: {
    authenticated: false,
    passwordHash: "",
  },
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const refs = {
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  sortSelect: document.getElementById("sortSelect"),
  favoriteOnly: document.getElementById("favoriteOnly"),
  productGrid: document.getElementById("productGrid"),
  productTemplate: document.getElementById("productTemplate"),
  resultsCount: document.getElementById("resultsCount"),
  cart: document.getElementById("cart"),
  cartItems: document.getElementById("cartItems"),
  cartCount: document.getElementById("cartCount"),
  openCart: document.getElementById("openCart"),
  closeCart: document.getElementById("closeCart"),
  openAdmin: document.getElementById("openAdmin"),
  closeAdmin: document.getElementById("closeAdmin"),
  adminPanel: document.getElementById("adminPanel"),
  adminLoginSection: document.getElementById("adminLoginSection"),
  adminSettingsSection: document.getElementById("adminSettingsSection"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  adminLoginButton: document.getElementById("adminLoginButton"),
  adminCurrentPassword: document.getElementById("adminCurrentPassword"),
  adminNewPassword: document.getElementById("adminNewPassword"),
  adminConfirmPassword: document.getElementById("adminConfirmPassword"),
  changeAdminPasswordButton: document.getElementById("changeAdminPasswordButton"),
  adminLogoutButton: document.getElementById("adminLogoutButton"),
  backdrop: document.getElementById("backdrop"),
  couponInput: document.getElementById("couponInput"),
  applyCoupon: document.getElementById("applyCoupon"),
  cepInput: document.getElementById("cepInput"),
  calcShipping: document.getElementById("calcShipping"),
  shippingNote: document.getElementById("shippingNote"),
  paymentSelect: document.getElementById("paymentSelect"),
  subtotalValue: document.getElementById("subtotalValue"),
  discountValue: document.getElementById("discountValue"),
  shippingValue: document.getElementById("shippingValue"),
  totalValue: document.getElementById("totalValue"),
  freeShipText: document.getElementById("freeShipText"),
  freeShipBar: document.getElementById("freeShipBar"),
  checkoutButton: document.getElementById("checkoutButton"),
  scrollToOffers: document.getElementById("scrollToOffers"),
};

function simpleHash(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function loadAdminStore() {
  const fallbackHash = simpleHash(DEFAULT_ADMIN_PASSWORD);

  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);

    if (!raw) {
      state.admin.passwordHash = fallbackHash;
      localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({ passwordHash: fallbackHash })
      );
      return;
    }

    const parsed = JSON.parse(raw);
    state.admin.passwordHash =
      typeof parsed.passwordHash === "string" ? parsed.passwordHash : fallbackHash;
  } catch (error) {
    state.admin.passwordHash = fallbackHash;
    localStorage.setItem(
      ADMIN_STORAGE_KEY,
      JSON.stringify({ passwordHash: fallbackHash })
    );
  }
}

function saveAdminStore() {
  localStorage.setItem(
    ADMIN_STORAGE_KEY,
    JSON.stringify({ passwordHash: state.admin.passwordHash })
  );
}

function renderAdmin() {
  refs.adminLoginSection.hidden = state.admin.authenticated;
  refs.adminSettingsSection.hidden = !state.admin.authenticated;
}

function openAdmin() {
  refs.adminPanel.classList.add("is-open");
  refs.adminPanel.setAttribute("aria-hidden", "false");
  refs.backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeAdmin() {
  refs.adminPanel.classList.remove("is-open");
  refs.adminPanel.setAttribute("aria-hidden", "true");
  refs.backdrop.hidden = true;
  document.body.style.overflow = "";
}

function adminLogin() {
  const inputPassword = refs.adminPasswordInput.value;

  if (simpleHash(inputPassword) !== state.admin.passwordHash) {
    window.alert("Senha de admin invalida.");
    return;
  }

  state.admin.authenticated = true;
  refs.adminPasswordInput.value = "";
  renderAdmin();
  window.alert("Login admin realizado com sucesso.");
}

function adminLogout() {
  state.admin.authenticated = false;
  refs.adminCurrentPassword.value = "";
  refs.adminNewPassword.value = "";
  refs.adminConfirmPassword.value = "";
  renderAdmin();
}

function changeAdminPassword() {
  if (!state.admin.authenticated) {
    window.alert("Voce precisa estar logado para alterar a senha.");
    return;
  }

  const current = refs.adminCurrentPassword.value;
  const next = refs.adminNewPassword.value;
  const confirm = refs.adminConfirmPassword.value;

  if (simpleHash(current) !== state.admin.passwordHash) {
    window.alert("Senha atual incorreta.");
    return;
  }

  if (next.length < 8) {
    window.alert("A nova senha deve ter ao menos 8 caracteres.");
    return;
  }

  if (next !== confirm) {
    window.alert("Confirmacao da nova senha nao confere.");
    return;
  }

  state.admin.passwordHash = simpleHash(next);
  saveAdminStore();

  refs.adminCurrentPassword.value = "";
  refs.adminNewPassword.value = "";
  refs.adminConfirmPassword.value = "";

  window.alert("Senha admin alterada com sucesso.");
}

function normalizeProduct(item, index) {
  return {
    id: String(item.id || `prod-${index + 1}`),
    name: String(item.name || "Produto"),
    category: String(item.category || "suplementos"),
    description: String(item.description || "Produto disponivel"),
    price: Number(item.price || 0),
    stock: Number(item.stock || 0),
    featured: Number(item.featured || index + 1),
    image: String(item.image || DEFAULT_IMAGE),
  };
}

async function loadProducts() {
  try {
    const response = await fetch("/products.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Catalogo externo indisponivel");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Catalogo externo invalido");
    }

    return data.map(normalizeProduct);
  } catch (error) {
    return FALLBACK_PRODUCTS.map(normalizeProduct);
  }
}

let productsSignature = "";

function getProductsSignature(products) {
  return JSON.stringify(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      featured: product.featured,
      image: product.image,
    }))
  );
}

function syncStateWithCatalog() {
  const productMap = new Map(state.products.map((product) => [product.id, product]));
  let changed = false;

  Object.keys(state.cart).forEach((productId) => {
    const product = productMap.get(productId);

    if (!product) {
      delete state.cart[productId];
      changed = true;
      return;
    }

    const nextQty = Math.min(product.stock, state.cart[productId]);

    if (nextQty <= 0) {
      delete state.cart[productId];
      changed = true;
      return;
    }

    if (nextQty !== state.cart[productId]) {
      state.cart[productId] = nextQty;
      changed = true;
    }
  });

  const filteredFavorites = state.favorites.filter((id) => productMap.has(id));
  if (filteredFavorites.length !== state.favorites.length) {
    state.favorites = filteredFavorites;
    changed = true;
  }

  if (changed) {
    saveStore();
  }

  return changed;
}

async function refreshProducts({ forceReload = false } = {}) {
  const latest = await loadProducts();
  const signature = getProductsSignature(latest);

  if (!forceReload && signature === productsSignature) {
    lastProductsSync = Date.now();
    return;
  }

  state.products = latest;
  productsSignature = signature;
  lastProductsSync = Date.now();
  syncStateWithCatalog();
  renderProducts();
  renderCart();
}

let liveSyncStarted = false;
let liveSyncIntervalId = null;
let lastProductsSync = 0;

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    startProductInterval();

    if (Date.now() - lastProductsSync > PRODUCT_REFRESH_INTERVAL) {
      refreshProducts({ forceReload: true });
    }
  } else {
    stopProductInterval();
  }
}

function handleStorageEvent(event) {
  if (event.key === STORAGE_KEY) {
    if (event.newValue) {
      loadStore();
    } else {
      resetStoreState();
    }

    renderProducts();
    renderCart();
    return;
  }

  if (event.key === ADMIN_STORAGE_KEY) {
    loadAdminStore();
    renderAdmin();
  }
}

function startProductInterval() {
  if (liveSyncIntervalId !== null) {
    return;
  }

  liveSyncIntervalId = window.setInterval(() => {
    refreshProducts();
  }, PRODUCT_REFRESH_INTERVAL);
}

function stopProductInterval() {
  if (liveSyncIntervalId === null) {
    return;
  }

  window.clearInterval(liveSyncIntervalId);
  liveSyncIntervalId = null;
}

function cleanupLiveSync() {
  stopProductInterval();

  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("storage", handleStorageEvent);
  window.removeEventListener("pagehide", cleanupLiveSync);
  liveSyncStarted = false;
}

function setupLiveSync() {
  if (liveSyncStarted) {
    return;
  }

  liveSyncStarted = true;
  startProductInterval();

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("storage", handleStorageEvent);
  window.addEventListener("pagehide", cleanupLiveSync);
}

function saveStore() {
  const payload = {
    cart: state.cart,
    favorites: state.favorites,
    coupon: state.coupon,
    cep: state.cep,
    payment: state.payment,
    shipping: state.shipping,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.cart = parsed.cart || {};
    state.favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
    state.coupon = typeof parsed.coupon === "string" ? parsed.coupon : null;
    state.cep = typeof parsed.cep === "string" ? parsed.cep : "";
    state.payment = parsed.payment || "pix";
    state.shipping =
      parsed.shipping && typeof parsed.shipping === "object"
        ? parsed.shipping
        : { ...INITIAL_SHIPPING_STATE };
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetStoreState({ persist = false } = {}) {
  Object.assign(state, defaultStoreState());

  if (persist) {
    saveStore();
  }
}

function formatCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function getShippingByCep(cepDigits) {
  if (cepDigits.length !== 8) {
    return {
      price: 0,
      region: "",
      message: "CEP invalido. Informe 8 digitos.",
    };
  }

  if (cepDigits.startsWith("5564")) {
    return {
      price: 0,
      region: "Gravata",
      message: "Entrega local em Gravata: frete gratis.",
    };
  }

  if (cepDigits.startsWith("55")) {
    return {
      price: 8.9,
      region: "Pernambuco",
      message: "Entrega para Pernambuco: frete reduzido.",
    };
  }

  return {
    price: 18.9,
    region: "Demais regioes",
    message: "Entrega nacional ativa para este CEP.",
  };
}

function filterProducts() {
  const search = state.search.trim().toLowerCase();

  return state.products.filter((product) => {
    const byCategory =
      state.category === "all" || product.category === state.category;
    const bySearch =
      search.length === 0 ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);
    const byFavorite =
      !state.favoriteOnly || state.favorites.includes(product.id);

    return byCategory && bySearch && byFavorite;
  });
}

function sortProducts(products) {
  const sorted = [...products];

  if (state.sort === "price-asc") {
    sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }

  if (state.sort === "price-desc") {
    sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }

  if (state.sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return sorted;
  }

  sorted.sort((a, b) => a.featured - b.featured);
  return sorted;
}

function toggleFavorite(productId) {
  if (state.favorites.includes(productId)) {
    state.favorites = state.favorites.filter((id) => id !== productId);
  } else {
    state.favorites = [...state.favorites, productId];
  }

  saveStore();
  renderProducts();
}

function renderProducts() {
  const products = sortProducts(filterProducts());
  refs.productGrid.innerHTML = "";

  refs.resultsCount.textContent = `${products.length} produto(s) encontrado(s)`;

  if (products.length === 0) {
    refs.productGrid.innerHTML =
      '<div class="empty-state">Nenhum produto encontrado com esse filtro.</div>';
    return;
  }

  products.forEach((product) => {
    const node = refs.productTemplate.content.cloneNode(true);
    const image = node.querySelector("img");
    const category = node.querySelector(".card__category");
    const title = node.querySelector(".card__title");
    const description = node.querySelector(".card__description");
    const price = node.querySelector(".card__price");
    const stock = node.querySelector(".card__stock");
    const favoriteBtn = node.querySelector(".favorite-btn");
    const button = node.querySelector(".card__button");

    image.src = product.image;
    image.alt = product.name;
    category.textContent = categoryLabel[product.category] || product.category;
    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = currency.format(product.price);
    stock.textContent = `${product.stock} em estoque`;

    const isFavorite = state.favorites.includes(product.id);
    favoriteBtn.textContent = isFavorite ? "★ Favoritado" : "☆ Favoritar";
    favoriteBtn.classList.toggle("is-active", isFavorite);

    favoriteBtn.addEventListener("click", () => toggleFavorite(product.id));
    button.addEventListener("click", () => addToCart(product.id));
    refs.productGrid.appendChild(node);
  });
}

function findProduct(productId) {
  return state.products.find((item) => item.id === productId);
}

function addToCart(productId) {
  const currentQty = state.cart[productId] || 0;
  const product = findProduct(productId);

  if (!product) {
    return;
  }

  if (currentQty >= product.stock) {
    window.alert("Estoque maximo atingido para este item.");
    return;
  }

  state.cart[productId] = currentQty + 1;
  saveStore();
  renderCart();
  openCart();
}

function changeQty(productId, delta) {
  const currentQty = state.cart[productId] || 0;
  const product = findProduct(productId);

  if (!product) {
    return;
  }

  const nextQty = Math.min(product.stock, Math.max(0, currentQty + delta));

  if (nextQty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = nextQty;
  }

  saveStore();
  renderCart();
}

function removeFromCart(productId) {
  delete state.cart[productId];
  saveStore();
  renderCart();
}

function getCartEntries() {
  return Object.entries(state.cart)
    .map(([id, qty]) => {
      const product = findProduct(id);
      return product ? { product, qty } : null;
    })
    .filter(Boolean);
}

function getTotals() {
  const entries = getCartEntries();
  const subtotal = entries.reduce(
    (acc, { product, qty }) => acc + product.price * qty,
    0
  );

  const couponDiscount = state.coupon === "GARRA10" ? subtotal * 0.1 : 0;
  const paymentDiscount = state.payment === "pix" ? subtotal * 0.1 : 0;
  const campaignDiscount = subtotal >= 300 ? subtotal * 0.05 : 0;

  let discount = couponDiscount + paymentDiscount + campaignDiscount;
  if (discount > subtotal) {
    discount = subtotal;
  }

  let shipping = state.shipping.price;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    shipping = 0;
  }

  const total = Math.max(0, subtotal - discount + shipping);

  return {
    subtotal,
    discount,
    shipping,
    total,
  };
}

function renderFreeShippingProgress(subtotal) {
  const progress = Math.max(
    0,
    Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  refs.freeShipBar.style.width = `${progress}%`;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    refs.freeShipText.textContent = "Voce desbloqueou frete gratis.";
    return;
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  refs.freeShipText.textContent =
    `Faltam ${currency.format(remaining)} para frete gratis.`;
}

function renderCart() {
  const entries = getCartEntries();
  refs.cartItems.innerHTML = "";

  if (entries.length === 0) {
    refs.cartItems.innerHTML =
      '<div class="empty-state">Seu carrinho esta vazio.</div>';
  } else {
    entries.forEach(({ product, qty }) => {
      const wrapper = document.createElement("article");
      wrapper.className = "cart-item";
      wrapper.innerHTML = `
        <div class="cart-item__top">
          <p class="cart-item__name">${product.name}</p>
          <p>${currency.format(product.price * qty)}</p>
        </div>
        <p>${currency.format(product.price)} cada</p>
        <div class="cart-item__actions">
          <div class="qty">
            <button type="button" data-action="minus">-</button>
            <span>${qty}</span>
            <button type="button" data-action="plus">+</button>
          </div>
          <button class="remove-btn" type="button">Remover</button>
        </div>
      `;

      wrapper
        .querySelector('[data-action="minus"]')
        .addEventListener("click", () => changeQty(product.id, -1));
      wrapper
        .querySelector('[data-action="plus"]')
        .addEventListener("click", () => changeQty(product.id, 1));
      wrapper
        .querySelector(".remove-btn")
        .addEventListener("click", () => removeFromCart(product.id));

      refs.cartItems.appendChild(wrapper);
    });
  }

  const totalItems = entries.reduce((acc, item) => acc + item.qty, 0);
  refs.cartCount.textContent = String(totalItems);
  refs.shippingNote.textContent = state.shipping.message;

  const totals = getTotals();
  refs.subtotalValue.textContent = currency.format(totals.subtotal);
  refs.discountValue.textContent = currency.format(totals.discount);
  refs.shippingValue.textContent = currency.format(totals.shipping);
  refs.totalValue.textContent = currency.format(totals.total);

  renderFreeShippingProgress(totals.subtotal);
}

function openCart() {
  refs.adminPanel.classList.remove("is-open");
  refs.adminPanel.setAttribute("aria-hidden", "true");

  refs.cart.classList.add("is-open");
  refs.cart.setAttribute("aria-hidden", "false");
  refs.backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  refs.cart.classList.remove("is-open");
  refs.cart.setAttribute("aria-hidden", "true");

  if (!refs.adminPanel.classList.contains("is-open")) {
    refs.backdrop.hidden = true;
  }

  document.body.style.overflow = "";
}

function applyCoupon() {
  const value = refs.couponInput.value.trim().toUpperCase();

  if (value === "GARRA10") {
    state.coupon = value;
    window.alert("Cupom aplicado com sucesso.");
  } else if (value.length === 0) {
    state.coupon = null;
    window.alert("Cupom removido.");
  } else {
    state.coupon = null;
    window.alert("Cupom invalido. Use GARRA10.");
  }

  saveStore();
  renderCart();
}

function calculateShipping() {
  const cepDigits = state.cep.replace(/\D/g, "");
  state.shipping = getShippingByCep(cepDigits);
  saveStore();
  renderCart();
}

function checkout() {
  const entries = getCartEntries();

  if (entries.length === 0) {
    window.alert("Adicione itens ao carrinho antes de finalizar.");
    return;
  }

  const totals = getTotals();
  const lines = entries.map(
    ({ product, qty }) =>
      `- ${product.name} x${qty} (${currency.format(product.price * qty)})`
  );

  const message = [
    "Ola, Garra Fit! Quero fechar este pedido:",
    ...lines,
    "",
    `Pagamento: ${state.payment}`,
    `CEP: ${state.cep || "Nao informado"}`,
    `Frete: ${currency.format(totals.shipping)}`,
    `Subtotal: ${currency.format(totals.subtotal)}`,
    `Desconto: ${currency.format(totals.discount)}`,
    `Total: ${currency.format(totals.total)}`,
    state.coupon ? `Cupom: ${state.coupon}` : "Cupom: sem cupom",
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank", "noopener");
}

function attachEvents() {
  refs.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  refs.categorySelect.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });

  refs.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  refs.favoriteOnly.addEventListener("change", (event) => {
    state.favoriteOnly = event.target.checked;
    renderProducts();
  });

  refs.openCart.addEventListener("click", openCart);
  refs.closeCart.addEventListener("click", closeCart);
  refs.openAdmin.addEventListener("click", () => {
    refs.cart.classList.remove("is-open");
    refs.cart.setAttribute("aria-hidden", "true");
    openAdmin();
  });
  refs.closeAdmin.addEventListener("click", closeAdmin);
  refs.adminLoginButton.addEventListener("click", adminLogin);
  refs.changeAdminPasswordButton.addEventListener("click", changeAdminPassword);
  refs.adminLogoutButton.addEventListener("click", adminLogout);
  refs.backdrop.addEventListener("click", () => {
    closeCart();
    closeAdmin();
  });
  refs.applyCoupon.addEventListener("click", applyCoupon);

  refs.cepInput.addEventListener("input", (event) => {
    state.cep = formatCep(event.target.value);
    event.target.value = state.cep;
    saveStore();
  });

  refs.calcShipping.addEventListener("click", calculateShipping);

  refs.paymentSelect.addEventListener("change", (event) => {
    state.payment = event.target.value;
    saveStore();
    renderCart();
  });

  refs.checkoutButton.addEventListener("click", checkout);
  refs.scrollToOffers.addEventListener("click", () => {
    document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
  });
}

async function init() {
  loadStore();
  loadAdminStore();
  state.products = await loadProducts();
  productsSignature = getProductsSignature(state.products);
  syncStateWithCatalog();
  lastProductsSync = Date.now();

  refs.couponInput.value = state.coupon || "";
  refs.cepInput.value = state.cep;
  refs.paymentSelect.value = state.payment;

  renderAdmin();
  attachEvents();
  renderProducts();
  renderCart();
  setupLiveSync();
}

init();
