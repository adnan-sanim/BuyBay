/* ===== SETTINGS — EDIT THESE ===== */
const CONFIG = {
  FB_PAGE: "61595044912189",           // Facebook Page ID: orders go to m.me/61595044912189
  WHATSAPP: "8801575478716",           // WhatsApp number with country code (no + or 0)
  HELPLINE: "01575478716",             // shown on site and used for Call button
  BKASH: "01613805381",                // your bKash number
  NAGAD: "01575478716",                // your Nagad number
  DELIVERY_DHAKA: 100,
  DELIVERY_OUTSIDE: 1500,
  FREE_OVER: 5000                      // free delivery above this subtotal
};
const COUPONS = { BUYBAY10: 10, WELCOME5: 5 }; // coupon code: % off. Edit freely
const DISTRICTS = ["Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur","Chattogram","Chuadanga","Cumilla","Cox's Bazar","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalakathi","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"];

// If a photo fails to load, show the product emoji instead of a broken image
document.addEventListener("error", e => {
  const t = e.target; if (t.tagName !== "IMG") return;
  const src = t.getAttribute("src") || "";
  // 1st failure: retry through a free image proxy (helps when a host is blocked on the visitor's network)
  if (/^https?:/.test(src) && !t.dataset.tried && !src.includes("wsrv.nl")) { t.dataset.tried = "1"; t.src = "https://wsrv.nl/?url=" + encodeURIComponent(src); return; }
  // 2nd failure: show the emoji instead of a broken image
  if (t.dataset.e) t.replaceWith(document.createTextNode(t.dataset.e)); else if (t.closest(".th")) t.closest(".th").style.display = "none";
}, true);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const ROOT = document.body.dataset.root || ""; // "" on root pages, "../" inside folders
const imgSrc = s => {
  s = String(s).trim();
  let m = s.match(/^https?:\/\/(?:www\.)?imgur\.com\/([A-Za-z0-9]+)$/);   // imgur page link -> direct image
  if (m) return "https://i.imgur.com/" + m[1] + ".jpg";
  m = s.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || s.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/);
  if (m) return "https://lh3.googleusercontent.com/d/" + m[1];         // Google Drive share link -> direct image
  return /^(https?:|\/|data:)/.test(s) ? s : ROOT + s;
};
const money = n => "৳" + Number(n).toLocaleString("en-IN");
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const byId = id => PRODUCTS.find(p => p.id === id);
const imgs = p => (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
const pic = p => imgs(p).length ? `<img referrerpolicy="no-referrer" src="${imgSrc(imgs(p)[0])}" alt="${p.name}" data-e="${p.emoji || "🛍️"}" loading="lazy">` : p.emoji;

let cart = load("bb_cart", {});   // {id: qty}
let wish = load("bb_wish", []);   // [id]
let view = "cart";
const F = { cat: "all", q: "", sort: "def", price: "a" };
const inPrice = x => F.price === "a" || (F.price === "1" && x < 1000) || (F.price === "2" && x >= 1000 && x <= 2500) || (F.price === "3" && x > 2500);

async function copyText(t, fallbackEl) {
  try { await navigator.clipboard.writeText(t); return true; } catch {}
  try { if (fallbackEl) { fallbackEl.select(); return document.execCommand("copy"); } } catch {}
  return false;
}
function toast(msg) {
  const t = $(".toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- shared shell ---------- */
function buildShell() {
  document.body.insertAdjacentHTML("afterbegin", `
  <div class="top"><span>📞 Helpline: <a href="tel:${CONFIG.HELPLINE}">${CONFIG.HELPLINE}</a></span><span>Free delivery over ${money(CONFIG.FREE_OVER)}</span><span>Use code <a>BUYBAY10</a> for 10% off</span></div>
  <header><div class="wrap nav">
    <button class="menu" id="menu" aria-label="Menu">☰</button>
    <a href="index.html" class="logo" aria-label="BuyBay home"><b>Buy</b><i>Bay</i></a>
    <nav id="nav"><a href="index.html">Home</a><a href="index.html#products">Shop</a><a href="index.html#reviews">Reviews</a><a href="warranty.html">Warranty</a><a href="contact.html">Contact</a></nav>
    <div class="search"><input id="hs" type="search" placeholder="Search BuyBay…" aria-label="Search"></div>
    <div class="icons">
      <button class="ib" id="wbtn" aria-label="Wishlist">♡<span class="cnt" id="wc">0</span></button>
      <button class="ib" id="cbtn" aria-label="Cart">🛒<span class="cnt" id="cc">0</span></button>
    </div></div></header>`);
  document.body.insertAdjacentHTML("beforeend", `
  <footer><div class="wrap">
    <div class="fgrid">
      <div><div class="logo"><b>Buy</b><i>Bay</i></div><p style="margin-top:8px">Trusted online shop in Bangladesh. Cash on Delivery, bKash and Nagad accepted.</p></div>
      <div><h4>Shop</h4><a href="index.html#categories">Categories</a><a href="index.html#products">All products</a><a href="index.html#reviews">Reviews</a></div>
      <div><h4>Help</h4><a data-fb href="#" target="_blank" rel="noopener">Facebook Page</a><a href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a><a href="tel:${CONFIG.HELPLINE}">Call ${CONFIG.HELPLINE}</a></div>
    </div>
    <div class="flinks"><a href="terms.html">Terms &amp; Conditions</a><a href="privacy.html">Privacy Policy</a><a href="warranty.html">Claim Warranty</a><a href="contact.html">Contact</a></div>
    <p class="copy">© ${new Date().getFullYear()} BuyBay. All rights reserved.</p></div></footer>
  <div class="ov" id="ov"></div>
  <aside class="drawer" id="drawer" aria-label="Cart"><div class="dh"><span id="dt"></span><button class="x" id="dx" aria-label="Close">✕</button></div><div class="db" id="db"></div><div class="df" id="df"></div></aside>
  <div class="modal" id="pm"><div class="mb"><button class="close" data-close aria-label="Close">✕</button><div id="pmc"></div></div></div>
  <div class="modal" id="cm2"><div class="mb"><button class="close" data-close aria-label="Close">✕</button><div id="cmc"></div></div></div>
  <a class="wa" href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">💬</a>
  <div class="toast" role="status"></div>`);
  $$("header a[href],footer a[href]").forEach(a => { const h = a.getAttribute("href"); if (/^(index|contact)\.html/.test(h)) a.setAttribute("href", ROOT + h); });
  $$("[data-fb]").forEach(a => a.href = "https://m.me/" + CONFIG.FB_PAGE);
  $$("[data-wa]").forEach(a => a.href = "https://wa.me/" + CONFIG.WHATSAPP);
  $$("[data-tel]").forEach(a => a.href = "tel:" + CONFIG.HELPLINE);
  $$("[data-hl]").forEach(s => s.textContent = CONFIG.HELPLINE);

  $("#menu").onclick = () => $("#nav").classList.toggle("open");
  $("#nav").onclick = () => $("#nav").classList.remove("open");
  $("#cbtn").onclick = () => openDrawer("cart");
  $("#wbtn").onclick = () => openDrawer("wish");
  $("#dx").onclick = $("#ov").onclick = closeAll;
  $$("[data-close]").forEach(b => b.onclick = closeAll);
  $$(".modal").forEach(m => m.onclick = e => { if (e.target === m) closeAll(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  $("#hs").addEventListener("input", e => {
    if ($("#grid")) { F.q = e.target.value; const q = $("#q"); if (q) q.value = F.q; renderGrid(); }
  });
  $("#hs").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      if ($("#grid")) $("#products").scrollIntoView();
      else location.href = ROOT + "index.html?q=" + encodeURIComponent(e.target.value);
    }
  });
}
function closeAll() {
  $("#drawer").classList.remove("open");
  $("#ov").classList.remove("open");
  $$(".modal").forEach(m => m.classList.remove("open"));
}
function openModal(id) { $("#ov").classList.add("open"); $(id).classList.add("open"); }

/* ---------- state ---------- */
function commit() {
  save("bb_cart", cart); save("bb_wish", wish);
  $("#cc").textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  $("#wc").textContent = wish.length;
  if ($("#drawer").classList.contains("open")) renderDrawer();
  if ($("#grid")) renderGrid();
}
function addToCart(id, n = 1) {
  const p = byId(id); if (!p || p.stock < 1) return;
  cart[id] = Math.min((cart[id] || 0) + n, p.stock);
  commit(); toast("Added to cart");
}
function setQty(id, q) { if (q < 1) delete cart[id]; else cart[id] = Math.min(q, byId(id).stock); commit(); }
function toggleWish(id) {
  wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id];
  commit(); toast(wish.includes(id) ? "Saved to wishlist" : "Removed from wishlist");
}
let direct = null;                    // set by "Buy now": checkout only this product, cart untouched
const items = () => direct || cart;
const subtotal = () => Object.entries(items()).reduce((s, [id, q]) => s + byId(+id).price * q, 0);
let coupon = null;
const discount = () => coupon ? Math.round(subtotal() * COUPONS[coupon] / 100) : 0;
const delivery = district => subtotal() === 0 || subtotal() >= CONFIG.FREE_OVER ? 0 : (district === "Dhaka" ? CONFIG.DELIVERY_DHAKA : CONFIG.DELIVERY_OUTSIDE);

/* ---------- drawer (cart / wishlist) ---------- */
function openDrawer(mode) { view = mode; renderDrawer(); $("#drawer").classList.add("open"); $("#ov").classList.add("open"); }
function renderDrawer() {
  const db = $("#db"), df = $("#df");
  if (view === "wish") {
    $("#dt").textContent = "Wishlist";
    db.innerHTML = wish.length ? wish.map(id => { const p = byId(id); return `
      <div class="row"><div class="t">${pic(p)}</div><div class="n"><b>${p.name}</b>${money(p.price)}</div>
      <button class="btn" style="padding:6px 14px" data-add="${id}">Add</button><button class="x" data-wish="${id}" aria-label="Remove">✕</button></div>`; }).join("")
      : `<p class="empty">Your wishlist is empty. Tap ♡ on any product to save it.</p>`;
    df.innerHTML = "";
  } else {
    $("#dt").textContent = "Your cart";
    const ids = Object.keys(cart).map(Number);
    db.innerHTML = ids.length ? ids.map(id => { const p = byId(id), q = cart[id]; return `
      <div class="row"><div class="t">${pic(p)}</div><div class="n"><b>${p.name}</b>${money(p.price * q)}</div>
      <div class="qty"><button data-dec="${id}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${id}" aria-label="Increase">+</button></div>
      <button class="x" data-rm="${id}" aria-label="Remove">✕</button></div>`; }).join("")
      : `<p class="empty">Your cart is empty. Add something you like!</p>`;
    df.innerHTML = ids.length ? `<div class="sum"><span>Subtotal</span><b>${money(subtotal())}</b></div>
      <p class="fd">${subtotal() >= CONFIG.FREE_OVER ? "🎉 You get free delivery!" : "Add " + money(CONFIG.FREE_OVER - subtotal()) + " more for free delivery"}</p><div class="bar"><i style="width:${Math.min(100, subtotal() / CONFIG.FREE_OVER * 100)}%"></i></div><div style="height:12px"></div>
      <button class="btn or full" id="go">Checkout</button>` : "";
    if (ids.length) $("#go").onclick = () => { direct = null; openCheckout(); };
  }
  db.onclick = e => {
    const d = e.target.closest("button"); if (!d) return;
    const g = k => +d.dataset[k];
    if (d.dataset.inc) setQty(g("inc"), cart[g("inc")] + 1);
    else if (d.dataset.dec) setQty(g("dec"), cart[g("dec")] - 1);
    else if (d.dataset.rm) setQty(g("rm"), 0);
    else if (d.dataset.add) { addToCart(g("add")); }
    else if (d.dataset.wish) toggleWish(g("wish"));
  };
}

/* ---------- product detail ---------- */
function gallery(p) {
  const im = imgs(p);
  if (!im.length) return `<div class="pic">${p.emoji}</div>`;
  const many = im.length > 1;
  return `<div class="gal"><div class="gmain"><img id="gm" data-e="${p.emoji || "🛍️"}" referrerpolicy="no-referrer" src="${imgSrc(im[0])}" alt="${p.name}">${many ? '<button class="gnav gp" aria-label="Previous image">‹</button><button class="gnav gn" aria-label="Next image">›</button>' : ""}</div>${many ? `<div class="thumbs">${im.map((s, i) => `<button class="th ${i ? "" : "on"}" data-i="${i}" aria-label="Image ${i + 1}"><img referrerpolicy="no-referrer" src="${imgSrc(s)}" alt=""></button>`).join("")}</div>` : ""}</div>`;
}
function initGallery(p) {
  const im = imgs(p); if (im.length < 2) return;
  let i = 0;
  const go = n => { i = (n + im.length) % im.length; const g = $("#gm"); if (g) { g.dataset.tried = ""; g.src = imgSrc(im[i]); } $$(".th").forEach((t, k) => t.classList.toggle("on", k === i)); };
  $(".gp").onclick = () => go(i - 1); $(".gn").onclick = () => go(i + 1);
  $$(".th").forEach(t => t.onclick = () => go(+t.dataset.i));
  let x = 0; const m = $(".gmain");
  m.addEventListener("touchstart", e => { x = e.touches[0].clientX; }, { passive: true });
  m.addEventListener("touchend", e => { const d = e.changedTouches[0].clientX - x; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); });
}
function openProduct(id) {
  const p = byId(id), out = p.stock < 1;
  $("#pmc").innerHTML = `<div class="pd">${gallery(p)}<div class="info">
    <small style="color:var(--mute)">${p.category}</small><h3 style="font-size:1.4rem;color:var(--navy)">${p.name}</h3>
    <div class="stars">${stars(p.rating)} <span style="color:var(--mute)">${p.rating}</span></div>
    <div class="price" style="font-size:1.5rem">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>
    <p>${p.desc}</p><p style="color:${out ? "#d00" : "#0a8a3a"};font-weight:600">${out ? "Out of stock" : p.stock + " in stock"}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:auto">
      <button class="btn" id="pa" ${out ? "disabled" : ""}>Add to cart</button>
      <button class="btn or" id="pb" ${out ? "disabled" : ""}>Buy now</button>
      <a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent("Hi BuyBay, I want to ask about: " + p.name)}">Ask on WhatsApp</a>
      <button class="btn ghost" id="pw">${wish.includes(id) ? "♥ Saved" : "♡ Wishlist"}</button></div></div></div>`;
  initGallery(p);
  $("#pa").onclick = () => addToCart(id);
  $("#pb").onclick = () => { direct = { [id]: 1 }; closeAll(); openCheckout(); };
  $("#pw").onclick = e => { toggleWish(id); e.target.textContent = wish.includes(id) ? "♥ Saved" : "♡ Wishlist"; };
  openModal("#pm");
}

/* ---------- checkout → Facebook Messenger ---------- */
function openCheckout() {
  if (!Object.keys(items()).length) return toast("Your cart is empty");
  $("#drawer").classList.remove("open");
  $("#cmc").innerHTML = `<div class="form"><h3>Checkout${direct ? " (Buy now)" : ""}</h3>
    ${direct ? `<div class="note">Buying now: <b>${byId(+Object.keys(direct)[0]).name}</b> x1. Your cart is not changed.</div>` : ""}
    <div class="two"><div><label for="fn">Full name *</label><input id="fn" autocomplete="name"></div>
    <div><label for="fp">Mobile number *</label><input id="fp" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="tel"></div></div>
    <div class="two"><div><label for="fd">District *</label><select id="fd"><option value="">Select district</option>${DISTRICTS.map(d => `<option>${d}</option>`).join("")}</select></div>
    <div><label for="ft">Thana / Upazila</label><input id="ft"></div></div>
    <div><label for="fa">Full address *</label><textarea id="fa" rows="2" placeholder="House, road, area"></textarea></div>
    <div><label>Payment method</label><div class="pay">
      <label><input type="radio" name="pm" value="Cash on Delivery" checked>💵 Cash on Delivery</label>
      <label><input type="radio" name="pm" value="bKash">bKash</label>
      <label><input type="radio" name="pm" value="Nagad">Nagad</label></div></div>
    <div id="pinfo"></div>
    <div class="two" style="grid-template-columns:1fr auto"><input id="cpn" placeholder="Coupon code (e.g. BUYBAY10)"><button type="button" class="btn ghost" id="capp">Apply</button></div>
    <div id="osum"></div><p class="err" id="ferr"></p>
    <button class="btn or full" id="place">Place Order</button>
    <button class="btn ghost full" id="mplace" type="button">Order in Messenger instead</button>
    <small style="color:var(--mute)">Place Order opens WhatsApp with your order details already filled in. Just press Send. Prefer Messenger? Use the second button.<br>By ordering you agree to our <a href="terms.html" target="_blank" style="color:var(--blue)">Terms</a>, <a href="privacy.html" target="_blank" style="color:var(--blue)">Privacy Policy</a> and <a href="warranty.html" target="_blank" style="color:var(--blue)">Warranty Policy</a>.</small></div>`;
  const upd = () => {
    const pay = $("input[name=pm]:checked").value, d = $("#fd").value, del = delivery(d);
    $("#pinfo").innerHTML = pay === "COD" || pay === "Cash on Delivery" ? "" : `<div class="note">Send <b id="tot2"></b> to our ${pay} <b>Personal</b> number <b>${pay === "bKash" ? CONFIG.BKASH : CONFIG.NAGAD}</b> via Send Money, then enter your Transaction ID:
      <input id="tx" placeholder="Transaction ID" style="margin-top:8px"></div>`;
    const total = subtotal() - discount() + del;
    if ($("#tot2")) $("#tot2").textContent = money(total);
    $("#osum").innerHTML = `<div class="sum"><span>Subtotal</span><span>${money(subtotal())}</span></div>
      ${discount() ? `<div class="sum"><span>Coupon ${coupon}</span><span>-${money(discount())}</span></div>` : ""}<div class="sum"><span>Delivery ${d ? "(" + d + ")" : ""}</span><span>${del ? money(del) : d ? "Free" : "Select district"}</span></div>
      <div class="sum tot"><span>Total</span><span>${money(total)}</span></div>`;
  };
  $$("input[name=pm]").forEach(r => r.onchange = upd); $("#fd").onchange = upd; upd();
  coupon = null; upd();
  $("#capp").onclick = () => { const c = $("#cpn").value.trim().toUpperCase(); if (COUPONS[c]) { coupon = c; toast("Coupon applied: " + COUPONS[c] + "% off"); } else { coupon = null; toast("Invalid coupon code"); } upd(); };
  $("#place").onclick = () => placeOrder("wa");
  $("#mplace").onclick = () => placeOrder("fb");
  openModal("#cm2");
}
function placeOrder(via) {
  const v = id => ($(id) ? $(id).value.trim() : "");
  const name = v("#fn"), phone = v("#fp"), dist = v("#fd"), addr = v("#fa"), pay = $("input[name=pm]:checked").value, tx = v("#tx");
  const err = m => { $("#ferr").textContent = m; };
  if (name.length < 2) return err("Please enter your full name.");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) return err("Enter a valid Bangladeshi mobile number, e.g. 01712345678.");
  if (!dist) return err("Please select your district.");
  if (addr.length < 8) return err("Please enter your full delivery address.");
  if (pay !== "Cash on Delivery" && tx.length < 6) return err("Enter your " + pay + " Transaction ID.");
  err("");
  const del = delivery(dist), disc = discount(), total = subtotal() - disc + del;
  const oid = "BB" + Date.now().toString().slice(-7);
  const lines = Object.entries(items()).map(([id, q]) => { const p = byId(+id); return `• ${p.name} x${q} = ${money(p.price * q)}`; });
  const msg = `🛍️ NEW ORDER ${oid}\n\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal())}${disc ? "\nDiscount (" + coupon + "): -" + money(disc) : ""}\nDelivery: ${money(del)}\nTOTAL: ${money(total)}\n\nPayment: ${pay}${tx ? "\nTrxID: " + tx : ""}\n\nName: ${name}\nPhone: ${phone}\nDistrict: ${dist}${v("#ft") ? "\nThana: " + v("#ft") : ""}\nAddress: ${addr}`;
  if (!direct) cart = {};   // Buy now keeps the cart as it was
  direct = null; commit();
  const wa = "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(msg);
  if (via !== "fb") { closeAll(); window.location.href = wa; return; }   // WhatsApp is the primary channel: message is pre-filled
  const fb = "https://m.me/" + CONFIG.FB_PAGE + "?text=" + encodeURIComponent(msg);
  $("#cmc").innerHTML = `<div class="form"><h3>✅ Order ${oid} placed. Details copied!</h3>
    <div class="note"><b>Your order details have been copied.</b> Tap <b>OK</b> to open our Messenger inbox, then <b>paste</b> the message (phone: long-press the message box, then Paste. PC: Ctrl+V) and press <b>Send</b> to confirm your order.</div>
    <textarea id="ocopy" rows="8" readonly></textarea>
    <p id="cstat" style="color:#0a8a3a;font-weight:600;min-height:1.2em"></p>
    <a class="btn or full" id="ofb" href="${fb}">OK, open Messenger</a>
    <button class="btn ghost full" id="ocbtn" type="button">Copy again</button>
    <a class="btn ghost full" href="${wa}">Send on WhatsApp instead</a></div>`;
  $("#ocopy").value = msg;
  const doCopy = async () => { const ok = await copyText(msg, $("#ocopy")); $("#cstat").textContent = ok ? "✔ Copied to clipboard" : "Could not copy automatically. Please tap Copy again."; };
  $("#ocbtn").onclick = async () => { await doCopy(); toast("Copied"); };
  $("#ofb").addEventListener("click", () => { copyText(msg, $("#ocopy")); });
  doCopy();
}

/* ---------- home page rendering ---------- */
function renderCats() {
  $("#cats").innerHTML = `<button class="cat ${F.cat === "all" ? "on" : ""}" data-c="all"><span>✨</span>All</button>` +
    CATEGORIES.map(c => `<button class="cat ${F.cat === c.name ? "on" : ""}" data-c="${c.name}"><span>${c.icon}</span>${c.name}</button>`).join("");
}
function renderGrid() {
  let list = PRODUCTS.filter(p => (F.cat === "all" || p.category === F.cat) && (p.name + p.category + p.desc).toLowerCase().includes(F.q.toLowerCase()) && inPrice(p.price));
  if (F.sort === "lo") list.sort((a, b) => a.price - b.price);
  if (F.sort === "hi") list.sort((a, b) => b.price - a.price);
  if (F.sort === "rate") list.sort((a, b) => b.rating - a.rating);
  $("#grid").innerHTML = list.length ? list.map(p => `
    <article class="card">
      ${p.oldPrice ? `<span class="off">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
      <button class="heart ${wish.includes(p.id) ? "on" : ""}" data-w="${p.id}" aria-label="Toggle wishlist">${wish.includes(p.id) ? "♥" : "♡"}</button>
      <div class="pic" data-v="${p.id}">${pic(p)}</div>
      <div class="info"><h3 data-v="${p.id}">${p.name}</h3><div class="stars">${stars(p.rating)}</div>
        <div class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>
        <button class="btn" data-a="${p.id}" ${p.stock < 1 ? "disabled" : ""}>${p.stock < 1 ? "Out of stock" : "Add to cart"}</button></div>
    </article>`).join("") : `<p class="empty">No products found. Try another search or category.</p>`;
}
function initHome() {
  const params = new URLSearchParams(location.search);
  F.q = params.get("q") || ""; $("#q").value = F.q; $("#hs").value = F.q;
  renderCats(); renderGrid();
  $("#cats").onclick = e => { const b = e.target.closest("[data-c]"); if (!b) return; F.cat = b.dataset.c; renderCats(); renderGrid(); $("#products").scrollIntoView(); };
  $("#q").oninput = e => { F.q = e.target.value; $("#hs").value = F.q; renderGrid(); };
  $("#price").onchange = e => { F.price = e.target.value; renderGrid(); };
  $("#sort").onchange = e => { F.sort = e.target.value; renderGrid(); };
  $("#grid").onclick = e => {
    const t = e.target.closest("[data-a],[data-w],[data-v]"); if (!t) return;
    if (t.dataset.a) addToCart(+t.dataset.a);
    else if (t.dataset.w) toggleWish(+t.dataset.w);
    else openProduct(+t.dataset.v);
  };
  $("#rgrid").innerHTML = REVIEWS.map(r => `<div class="rev"><div class="stars">${stars(r.rating)}</div><p>${r.text}</p><small><b>${r.name}</b>, ${r.city}</small></div>`).join("");
}
function initWarranty() {
  $("#wpr").innerHTML = '<option value="">Select product</option>' + PRODUCTS.map(p => `<option>${p.name}</option>`).join("");
  const send = via => {
    const g = id => $(id).value.trim();
    if (!g("#wo") || !g("#wn") || !g("#wpr") || g("#wi").length < 10 || !/^(?:\+?88)?01[3-9]\d{8}$/.test(g("#wp").replace(/[\s-]/g, ""))) { $("#werr").textContent = "Please fill every field, with a valid mobile number and a short description of the problem."; return; }
    $("#werr").textContent = "";
    const msg = `🛠️ WARRANTY CLAIM\n\nOrder ID: ${g("#wo")}\nName: ${g("#wn")}\nPhone: ${g("#wp")}\nProduct: ${g("#wpr")}\nProblem: ${g("#wi")}`;
    try { navigator.clipboard && navigator.clipboard.writeText(msg); } catch {}
    if (via !== "wa") toast("Details copied. Paste them in Messenger and press Send.");
    window.open((via === "wa" ? "https://wa.me/" + CONFIG.WHATSAPP : "https://m.me/" + CONFIG.FB_PAGE) + "?text=" + encodeURIComponent(msg), "_blank");
  };
  $("#wsend").onclick = () => send("wa"); $("#wwa").onclick = () => send("fb");
}
function initContact() {
  $("#csend").onclick = () => {
    const n = $("#cn").value.trim(), p = $("#cp").value.trim(), m = $("#cm").value.trim();
    if (!n || !m) { $("#cerr").textContent = "Please enter your name and message."; return; }
    window.open("https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(`Hello BuyBay, I'm ${n}${p ? " (" + p + ")" : ""}.\n${m}`), "_blank");
  };
}

buildShell(); commit();
if ($("#grid")) initHome();
if ($("#cform")) initContact();
if ($("#wform")) initWarranty();
