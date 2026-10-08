// Product objects keep the details used to build each card.
const products = [
  { id: 1, name: "Classic Backpack", description: "Room for the daily essentials, built to go further.", price: 68, image: "assets/backpack.jpg", tag: "Bestseller" },
  { id: 2, name: "Minimal Watch", description: "A quiet, easy-to-read face with a leather strap.", price: 94, image: "assets/watch.jpg", tag: "Everyday" },
  { id: 3, name: "Canvas Sneakers", description: "An easy-wearing staple for wherever the day leads.", price: 72, image: "assets/sneakers.jpg", tag: "New" },
  { id: 4, name: "Leather Wallet", description: "Slim, considered storage for the things you carry.", price: 48, image: "assets/wallet.jpg", tag: "Small batch" },
  { id: 5, name: "Ceramic Mug", description: "A handmade-feel shape for your daily first pour.", price: 26, image: "assets/mug.jpg", tag: "Hand finished" },
  { id: 6, name: "Wireless Headphones", description: "Clear sound and a comfortable fit, all day long.", price: 118, image: "assets/headphones.jpg", tag: "Listen well" }
];

// Each cart entry is a product object with a quantity.
const cart = [];
const productGrid = document.querySelector("#product-grid");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartToast = document.querySelector("#cart-toast");
let toastTimer;
const shippingThreshold = 100;

function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

function showProducts() {
  // map() creates one product card for every object in the products array.
  productGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <div class="product-title-line"><h3>${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
        <p class="product-description">${product.description}</p>
        <button class="add-button" data-product-id="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
      </div>
    </article>
  `).join("");
}

function addToCart(productId, addButton) {
  const productCard = addButton.closest(".product-card");
  animateProductToBag(productCard.querySelector(".product-image"));
  const product = products.find((item) => item.id === productId);
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else if (product) {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  cartCount.classList.remove("count-pop");
  void cartCount.offsetWidth;
  cartCount.classList.add("count-pop");
  showAddedMessage(product.name);
  const addedRow = cartItems.querySelector(`[data-cart-item-id="${productId}"]`);
  if (addedRow) {
    addedRow.classList.add("cart-item-added");
    window.setTimeout(() => addedRow.classList.remove("cart-item-added"), 1100);
  }
}


function showAddedMessage(productName) {
  cartToast.textContent = `${productName} added to your cart.`;
  cartToast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => cartToast.classList.remove("is-visible"), 2600);
}

function animateProductToBag(productImage) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const start = productImage.getBoundingClientRect();
  const destination = cartCount.getBoundingClientRect();
  const flyingImage = productImage.cloneNode();
  flyingImage.classList.add("flying-product");
  flyingImage.style.left = `${start.left}px`;
  flyingImage.style.top = `${start.top}px`;
  flyingImage.style.width = `${start.width}px`;
  flyingImage.style.height = `${start.height}px`;
  document.body.appendChild(flyingImage);

  requestAnimationFrame(() => {
    const moveX = destination.left + destination.width / 2 - (start.left + start.width / 2);
    const moveY = destination.top + destination.height / 2 - (start.top + start.height / 2);
    flyingImage.style.transform = `translate(${moveX}px, ${moveY}px) scale(.12) rotate(8deg)`;
    flyingImage.style.opacity = "0.25";
  });

  flyingImage.addEventListener("transitionend", () => flyingImage.remove(), { once: true });
  window.setTimeout(() => flyingImage.remove(), 900);
}
function removeFromCart(productId) {
  // filter() returns all cart entries except the selected product.
  const remainingItems = cart.filter((item) => item.id !== productId);
  cart.splice(0, cart.length, ...remainingItems);
  updateCart();
}

function increaseQuantity(productId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) cartItem.quantity += 1;
  updateCart();
}

function decreaseQuantity(productId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      removeFromCart(productId);
      return;
    }
  }
  updateCart();
}

function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let shipping = 0;
  if (subtotal === 0 || subtotal >= shippingThreshold) {
    shipping = 0;
  } else {
    shipping = 8;
  }
  return { subtotal, shipping, total: subtotal + shipping };
}

function updateCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = itemCount;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your bag is empty. Find something useful in the collection above.</p>';
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item" data-cart-item-id="${item.id}">
        <img class="cart-item-image" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h3>${item.name}</h3><p>${formatPrice(item.price)} each</p>
          <div class="quantity-control" aria-label="Quantity controls for ${item.name}">
            <button type="button" data-action="decrease" data-product-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" data-product-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
            <button type="button" class="remove-button" data-action="remove" data-product-id="${item.id}">Remove</button>
          </div>
        </div>
        <span class="item-subtotal">${formatPrice(item.price * item.quantity)}</span>
      </article>
    `).join("");
  }

  const totals = calculateTotal();
  document.querySelector("#subtotal").textContent = formatPrice(totals.subtotal);
  document.querySelector("#shipping").textContent = totals.shipping === 0 && totals.subtotal > 0 ? "On us" : formatPrice(totals.shipping);
  document.querySelector("#total").textContent = formatPrice(totals.total);
  document.querySelector("#shipping-note").textContent = totals.subtotal >= shippingThreshold
    ? "Your order qualifies for free shipping."
    : `Free shipping when you spend ${formatPrice(shippingThreshold - totals.subtotal)} more.`;
  document.querySelector("#cart-heading-note").textContent = itemCount === 0
    ? "Nothing in here just yet."
    : `${itemCount} ${itemCount === 1 ? "good thing" : "good things"} in your bag.`;
}

// Event delegation lets the product grid handle all Add buttons.
productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-button");
  if (button) addToCart(Number(button.dataset.productId), button);
});

// One cart listener handles increase, decrease, and remove actions.
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const productId = Number(button.dataset.productId);
  if (button.dataset.action === "increase") increaseQuantity(productId);
  else if (button.dataset.action === "decrease") decreaseQuantity(productId);
  else if (button.dataset.action === "remove") removeFromCart(productId);
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your bag is empty. Add something you love first.");
  } else {
    alert("Checkout functionality coming soon.");
  }
});

showProducts();

// Reveal page sections as they enter the viewport. Older browsers show them immediately.
function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".catalog-topline, .section-heading, .product-card, .about-strip, .about-me, .cart-heading, .cart-items, .order-summary, .site-footer");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => {
    item.classList.add("reveal-ready");
    revealObserver.observe(item);
  });
}

setupRevealAnimations();
updateCart();










