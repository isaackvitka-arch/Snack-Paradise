let selectedEventType = 'Boda';
let guestsCount = 100;
const whatsappPhone = "525500000000"; 

document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initMobileMenu();
    initCalculator();
});

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    btn?.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
}

function initCalculator() {
    const eventButtons = document.querySelectorAll('.event-type-btn');
    const slider = document.getElementById('guests-slider');
    const guestsDisplay = document.getElementById('guests-count-display');
    const themeSelect = document.getElementById('calc-theme');
    const barCheckboxes = document.querySelectorAll('input[name="calc-bars"]');
    const cartCheckboxes = document.querySelectorAll('input[name="calc-carts"]');
    const staffCheckbox = document.getElementById('calc-addon-staff');
    const customCheckbox = document.getElementById('calc-addon-custom');
    const whatsappBtn = document.getElementById('btn-whatsapp-quote');

    // Manejo de botones de tipo de evento
    eventButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            eventButtons.forEach(b => {
                b.classList.remove('ring-2', 'ring-brand-accent', 'bg-pink-50');
                b.classList.add('bg-white');
            });
            btn.classList.add('ring-2', 'ring-brand-accent', 'bg-pink-50');
            btn.classList.remove('bg-white');
            selectedEventType = btn.getAttribute('data-value') || 'Boda';
            updateCalculator();
        });
    });

    // Evento del slider de invitados
    if (slider && guestsDisplay) {
        slider.addEventListener('input', (e) => {
            guestsCount = parseInt(e.target.value) || 0;
            guestsDisplay.textContent = `${guestsCount} personas`;
            updateCalculator();
        });
    }

    // Escuchar cambios en selecciones e inputs
    themeSelect?.addEventListener('change', updateCalculator);
    barCheckboxes.forEach(cb => cb.addEventListener('change', updateCalculator));
    cartCheckboxes.forEach(cb => cb.addEventListener('change', updateCalculator));
    staffCheckbox?.addEventListener('change', updateCalculator);
    customCheckbox?.addEventListener('change', updateCalculator);

    whatsappBtn?.addEventListener('click', sendWhatsAppQuote);

    // Calcular el precio inicial
    updateCalculator();
}

function updateCalculator() {
    const themeSelect = document.getElementById('calc-theme');
    const checkedBars = Array.from(document.querySelectorAll('input[name="calc-bars"]:checked')).map(cb => cb.value);
    
    // Sumar precios de carritos multiplicados por número de invitados
    const checkedCartsElements = Array.from(document.querySelectorAll('input[name="calc-carts"]:checked'));
    const checkedCartsNames = checkedCartsElements.map(cb => cb.value);
    
    let cartsTotalPrice = 0;
    checkedCartsElements.forEach(cb => {
        const unitPrice = parseInt(cb.getAttribute('data-price') || 0);
        cartsTotalPrice += unitPrice * guestsCount;
    });

    const staffChecked = document.getElementById('calc-addon-staff')?.checked;
    const customChecked = document.getElementById('calc-addon-custom')?.checked;

    // Base por persona según la cantidad de barras tradicionales
    let baseCostPerGuest = 38; 
    const activeBarsCount = checkedBars.length;
    if (activeBarsCount === 0) baseCostPerGuest = 0;
    else if (activeBarsCount === 2) baseCostPerGuest = 48;

    let total = (guestsCount * baseCostPerGuest) + cartsTotalPrice;

    if (checkedBars.length > 0) total += 1200; // Montaje base si hay barras tradicionales

    if (staffChecked && total > 0) total += 600;
    if (customChecked && total > 0) total += 400;

    // Actualizar elementos del resumen en la vista
    const summaryEvent = document.getElementById('summary-event');
    const summaryGuests = document.getElementById('summary-guests');
    const summaryTheme = document.getElementById('summary-theme');
    const summaryPrice = document.getElementById('summary-price');

    if (summaryEvent) summaryEvent.textContent = selectedEventType;
    if (summaryGuests) summaryGuests.textContent = `${guestsCount} personas`;
    if (summaryTheme && themeSelect) summaryTheme.textContent = themeSelect.value.split('(')[0];
    
    if (summaryPrice) {
        summaryPrice.innerHTML = `$${total.toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-300">MXN</span>`;
    }

    const barsListEl = document.getElementById('summary-bars-list');
    if (barsListEl) {
        barsListEl.innerHTML = '';
        
        if (checkedBars.length === 0 && checkedCartsNames.length === 0) {
            barsListEl.innerHTML = '<li class="text-amber-300">Selecciona al menos una barra o carrito</li>';
        } else {
            checkedBars.forEach(bar => {
                const li = document.createElement('li');
                li.textContent = bar;
                barsListEl.appendChild(li);
            });
            checkedCartsNames.forEach(cart => {
                const li = document.createElement('li');
                li.textContent = `🛒 ${cart}`;
                li.className = 'text-amber-300 font-semibold';
                barsListEl.appendChild(li);
            });
        }
    }
}

function sendWhatsAppQuote() {
    const themeSelect = document.getElementById('calc-theme');
    const theme = themeSelect ? themeSelect.value : '';
    
    // Obtener barras y carritos seleccionados
    const checkedBars = Array.from(document.querySelectorAll('input[name="calc-bars"]:checked')).map(cb => `• ${cb.value}`).join('\n');
    const checkedCarts = Array.from(document.querySelectorAll('input[name="calc-carts"]:checked')).map(cb => `• ${cb.value}`).join('\n');
    
    const priceEl = document.getElementById('summary-price');
    const price = priceEl ? priceEl.textContent.trim() : '$0 MXN';

    // Texto del mensaje
    const message = `¡Hola! Me interesa cotizar un evento con la siguiente configuración:

📌 *Tipo de Evento:* ${selectedEventType}
👥 *Invitados:* ${guestsCount} personas
🎨 *Estilo:* ${theme}

🍬 *Barras Seleccionadas:*
${checkedBars || 'Ninguna'}

🛒 *Carritos Especiales Seleccionados:*
${checkedCarts || 'Ninguno'}

💰 *Costo Estimado:* ${price}

¿Tienen disponibilidad de agenda?`;

    // Uso de encodeURIComponent + api.whatsapp.com para asegurar la entrega del texto en WhatsApp Web / App
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
}