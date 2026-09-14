/**
 * RISE N GRIND — CART + CHECKOUT
 * -------------------------------
 * Handles: rendering the menu from menu.js, the cart drawer, and
 * sending the order to the Netlify function that talks to Stripe.
 *
 * You should not need to edit this file when updating the menu —
 * only js/menu.js.
 */

const CART_KEY = "rng_cart_v1";

function loadCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let cart = loadCart();

function money(n) {
  return `$${n.toFixed(2)}`;
}

function lineItemPrice(item, sizeIndex) {
  const size = item.sizes && item.sizes[sizeIndex];
  return item.price + (size ? size.diff : 0);
}

function addToCart(itemId, sizeIndex, qty) {
  const item = MENU_ITEMS.find((i) => i.id === itemId);
  if (!item || item.soldOut) return;

  const key = `${itemId}::${sizeIndex ?? "base"}`;
  const existing = cart.find((c) => c.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id: item.id,
      name: item.name,
      sizeLabel: item.sizes ? item.sizes[sizeIndex].label : null,
      unitPrice: lineItemPrice(item, sizeIndex),
      qty,
    });
  }
  saveCart(cart);
  renderCart();
  openCart();
}

function removeFromCart(key) {
  cart = cart.filter((c) => c.key !== key);
  saveCart(cart);
  renderCart();
}

function changeQty(key, delta) {
  const line = cart.find((c) => c.key === key);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    removeFromCart(key);
  } else {
    saveCart(cart);
    renderCart();
  }
}

function cartTotal() {
  return cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

// ---------- Rendering ----------

function renderMenu() {
  const container = document.getElementById("menu-sections");
  if (!container) return;
  container.innerHTML = "";

  CATEGORIES.forEach((cat) => {
    const items = MENU_ITEMS.filter((i) => i.category === cat.id);
    if (items.length === 0) return;

    const section = document.createElement("div");
    section.className = "menu-category";
    section.innerHTML = `<h3 class="menu-category-title">${cat.label}</h3>`;

    const grid = document.createElement("div");
    grid.className = "menu-grid";

    items.forEach((item) => {
      grid.appendChild(renderMenuCard(item));
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function renderMenuCard(item) {
  const card = document.createElement("div");
  card.className = "menu-card" + (item.soldOut ? " sold-out" : "");

  const sizeOptions = item.sizes
    ? `<select class="size-select" data-item="${item.id}">
        ${item.sizes
          .map(
            (s, idx) =>
              `<option value="${idx}">${s.label} — ${money(
                item.price + s.diff
              )}</option>`
          )
          .join("")}
      </select>`
    : "";

  card.innerHTML = `
    <div class="menu-card-top">
      <h4>${item.name}</h4>
      <span class="menu-price">${money(item.price)}</span>
    </div>
    <p class="menu-desc">${item.desc}</p>
    ${sizeOptions}
    ${
      item.soldOut
        ? `<span class="sold-out-tag">Sold out</span>`
        : `<button class="add-btn" data-item="${item.id}">Add to order</button>`
    }
  `;

  if (!item.soldOut) {
    const btn = card.querySelector(".add-btn");
    const sizeSelect = card.querySelector(".size-select");
    btn.addEventListener("click", () => {
      const sizeIndex = sizeSelect ? parseInt(sizeSelect.value, 10) : undefined;
      addToCart(item.id, sizeIndex, 1);
    });
  }

  return card;
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const countEls = document.querySelectorAll(".cart-count");
  const emptyMsg = document.getElementById("cart-empty");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!list) return;

  list.innerHTML = "";

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  cart.forEach((line) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-info">
        <span class="cart-row-name">${line.name}${
      line.sizeLabel ? ` <span class="cart-row-size">(${line.sizeLabel})</span>` : ""
    }</span>
        <span class="cart-row-price">${money(line.unitPrice * line.qty)}</span>
      </div>
      <div class="cart-row-controls">
        <button class="qty-btn" data-key="${line.key}" data-delta="-1" aria-label="Remove one">–</button>
        <span class="qty-value">${line.qty}</span>
        <button class="qty-btn" data-key="${line.key}" data-delta="1" aria-label="Add one">+</button>
        <button class="remove-btn" data-key="${line.key}" aria-label="Remove item">Remove</button>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeQty(btn.dataset.key, parseInt(btn.dataset.delta, 10));
    });
  });
  list.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.key));
  });

  if (totalEl) totalEl.textContent = money(cartTotal());
  countEls.forEach((el) => (el.textContent = cartCount()));
}

// ---------- Cart drawer open/close ----------

function openCart() {
  document.getElementById("cart-drawer")?.classList.add("open");
  document.getElementById("cart-overlay")?.classList.add("open");
}

function closeCart() {
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.getElementById("cart-overlay")?.classList.remove("open");
}

// ---------- Checkout ----------

async function startCheckout() {
  const checkoutBtn = document.getElementById("checkout-btn");
  const errorEl = document.getElementById("checkout-error");
  if (errorEl) errorEl.textContent = "";
  if (cart.length === 0) return;

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Redirecting to payment…";

  try {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          sizeLabel: c.sizeLabel,
          unitPrice: c.unitPrice,
          qty: c.qty,
        })),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Something went wrong starting checkout.");
    }

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No checkout URL returned.");
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent =
        err.message ||
        "Couldn't start checkout. Please try again in a moment.";
    }
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Pay & order";
  }
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();

  document.getElementById("cart-toggle")?.addEventListener("click", openCart);
  document.getElementById("cart-close")?.addEventListener("click", closeCart);
  document.getElementById("cart-overlay")?.addEventListener("click", closeCart);
  document.getElementById("checkout-btn")?.addEventListener("click", startCheckout);

  // If we just came back from a cancelled Stripe checkout, keep the cart.
  // If we came back from a successful one, clear it.
  const params = new URLSearchParams(window.location.search);
  if (params.get("order") === "success") {
    cart = [];
    saveCart(cart);
  }
});
