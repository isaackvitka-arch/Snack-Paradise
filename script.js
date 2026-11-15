/* Snack Paradise: the event calculator. Nav, menu, motion and the hover layer come from assets/. */
const WHATSAPP_PHONE = '525659145042';
let selectedEventType = 'Boda';
let guestsCount = 100;

document.addEventListener('DOMContentLoaded', initCalculator);

function openWhatsApp(message) {
  window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function initCalculator() {
  const chips = document.querySelectorAll('.calc__chip');
  const slider = document.getElementById('guests-slider');
  const guestsDisplay = document.getElementById('guests-count-display');

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    selectedEventType = chip.dataset.value || 'Boda';
    updateCalculator();
  }));

  slider?.addEventListener('input', e => {
    guestsCount = parseInt(e.target.value, 10) || 0;
    if (guestsDisplay) guestsDisplay.textContent = `${guestsCount} personas`;
    updateCalculator();
  });

  document.getElementById('calc-theme')?.addEventListener('change', updateCalculator);
  document.querySelectorAll('input[name="calc-bars"], input[name="calc-carts"], #calc-addon-staff, #calc-addon-custom')
    .forEach(cb => cb.addEventListener('change', updateCalculator));
  document.getElementById('btn-whatsapp-quote')?.addEventListener('click', sendWhatsAppQuote);

  updateCalculator();
}

function computeTotal() {
  const bars = document.querySelectorAll('input[name="calc-bars"]:checked').length;
  let total = 0;
  document.querySelectorAll('input[name="calc-carts"]:checked').forEach(cb => {
    total += (parseInt(cb.dataset.price, 10) || 0) * guestsCount;
  });
  // base por invitado según cuántas barras tradicionales se eligen, más el montaje base
  if (bars === 1) total += guestsCount * 38 + 1200;
  if (bars === 2) total += guestsCount * 48 + 1200;
  if (total > 0 && document.getElementById('calc-addon-staff')?.checked) total += 600;
  if (total > 0 && document.getElementById('calc-addon-custom')?.checked) total += 400;
  return total;
}

function updateCalculator() {
  const theme = document.getElementById('calc-theme');
  const bars = [...document.querySelectorAll('input[name="calc-bars"]:checked')].map(cb => cb.value);
  const carts = [...document.querySelectorAll('input[name="calc-carts"]:checked')].map(cb => cb.value);

  setText('summary-event', selectedEventType);
  setText('summary-guests', `${guestsCount} personas`);
  if (theme) setText('summary-theme', theme.value);

  const price = document.getElementById('summary-price');
  if (price) price.innerHTML = `$${computeTotal().toLocaleString('es-MX')} <span>MXN</span>`;

  const list = document.getElementById('summary-bars-list');
  if (!list) return;
  list.replaceChildren();
  const items = [...bars, ...carts];
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'is-empty';
    li.textContent = 'Elige al menos una barra o un carrito.';
    list.append(li);
    return;
  }
  items.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    list.append(li);
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function sendWhatsAppQuote() {
  const theme = document.getElementById('calc-theme')?.value || '';
  const bars = [...document.querySelectorAll('input[name="calc-bars"]:checked')].map(cb => `• ${cb.value}`).join('\n');
  const carts = [...document.querySelectorAll('input[name="calc-carts"]:checked')].map(cb => `• ${cb.value}`).join('\n');
  const price = document.getElementById('summary-price')?.textContent.trim() || '$0 MXN';

  openWhatsApp(`¡Hola! Me interesa cotizar un evento:

📌 *Tipo de evento:* ${selectedEventType}
👥 *Invitados:* ${guestsCount} personas
🎨 *Estilo:* ${theme}

🍬 *Barras:*
${bars || 'Ninguna'}

🛒 *Carritos:*
${carts || 'Ninguno'}

💰 *Estimado:* ${price}

📅 Fecha:
📍 Lugar:

¿Tienen disponibilidad?`);
}

/* Cart photographs uncover as they reach the screen. Nothing is hidden unless this runs. */
(function revealCarts() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll('.mx-cart:not(.mx-cart--cta)');
  if (!cards.length) return;
  document.documentElement.classList.add('mx-reveal-on');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  cards.forEach(c => io.observe(c));
  // never leave a picture covered (print, screenshots, odd scroll containers)
  setTimeout(() => cards.forEach(c => c.classList.add('is-in')), 4000);
})();
