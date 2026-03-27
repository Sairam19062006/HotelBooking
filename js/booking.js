import { animateOnScroll, fetchHotels, formatPrice, initBaseUI, showToast } from "./common.js";
import { getBasePrice, getDiscountPercent, getUrgencyText } from "./hotelMeta.js";

const BOOKINGS_KEY = "hb-bookings";
let selectedHotel = null;

const getParams = () => new URLSearchParams(window.location.search);

const calculateNights = (checkin, checkout) => {
  if (!checkin || !checkout) return 1;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Number.isNaN(diff) || diff < 1 ? 1 : diff;
};

const getBookings = () => {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveBooking = (payload) => {
  const bookings = getBookings();
  bookings.push(payload);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

const renderNotFound = () => {
  const root = document.querySelector("[data-booking-root]");
  if (!root) return;
  root.innerHTML = '<div class="glass-card" style="padding:24px">Hotel not found. <a href="listings.html" data-transition>Back to listings</a></div>';
};

const render = (hotel, params) => {
  const root = document.querySelector("[data-booking-root]");
  if (!root) return;

  root.innerHTML = `
    <section class="section" style="padding-top:36px">
      <div class="glass-card" style="padding:24px" data-animate>
        <div class="section-header" style="margin-bottom:12px">
          <div>
            <h1 class="section-title" style="margin:0">Complete your booking</h1>
            <p class="section-subtitle">${hotel.name} • ${hotel.city}, ${hotel.country}</p>
            <p class="meta" style="margin-top:8px">${getUrgencyText(hotel)} • ${hotel.reviewsCount} verified reviews</p>
          </div>
          <div class="price">${formatPrice(hotel.pricePerNight)} <span class="meta">/ night</span></div>
        </div>

        <div class="value-strip">
          <strong>${getDiscountPercent(hotel)}% deal applied</strong>
          <span class="meta">Regular rate ${formatPrice(getBasePrice(hotel))} per night</span>
        </div>

        <form data-booking-form>
          <div class="form-grid">
            <div class="field">
              <label class="label" for="fullName">Full Name</label>
              <input class="input" id="fullName" name="fullName" required placeholder="John Doe">
            </div>
            <div class="field">
              <label class="label" for="email">Email</label>
              <input class="input" id="email" name="email" type="email" required placeholder="john@email.com">
            </div>
            <div class="field">
              <label class="label" for="checkin">Check-in</label>
              <input class="input" id="checkin" name="checkin" type="date" value="${params.get("checkin") || ""}" required>
            </div>
            <div class="field">
              <label class="label" for="checkout">Check-out</label>
              <input class="input" id="checkout" name="checkout" type="date" value="${params.get("checkout") || ""}" required>
            </div>
            <div class="field full">
              <label class="label">Guests</label>
              <div class="guest-selector">
                <button class="icon-btn ripple" type="button" data-guest-minus>-</button>
                <input class="input" style="max-width:90px; text-align:center" id="guests" name="guests" value="${params.get("guests") || 2}" readonly>
                <button class="icon-btn ripple" type="button" data-guest-plus>+</button>
              </div>
            </div>
          </div>

          <div class="price-breakdown" data-breakdown></div>

          <div style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap">
            <a class="btn btn-secondary" href="details.html?id=${hotel.id}" data-transition>Back to details</a>
            <button class="btn btn-primary ripple" type="submit">Confirm Booking</button>
          </div>
        </form>
      </div>
    </section>
  `;

  animateOnScroll();
};

const updateBreakdown = () => {
  const checkin = document.querySelector("#checkin")?.value;
  const checkout = document.querySelector("#checkout")?.value;
  const guests = Number(document.querySelector("#guests")?.value || 1);
  const nights = calculateNights(checkin, checkout);
  const subtotal = nights * selectedHotel.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee + taxes;

  const breakdown = document.querySelector("[data-breakdown]");
  if (!breakdown) return;

  breakdown.innerHTML = `
    <h3 style="margin:16px 0 2px">Price breakdown</h3>
    <div class="breakdown-row"><span>${formatPrice(selectedHotel.pricePerNight)} x ${nights} night(s)</span><strong>${formatPrice(subtotal)}</strong></div>
    <div class="breakdown-row"><span>Guests</span><strong>${guests}</strong></div>
    <div class="breakdown-row"><span>Service fee</span><strong>${formatPrice(serviceFee)}</strong></div>
    <div class="breakdown-row"><span>Taxes</span><strong>${formatPrice(taxes)}</strong></div>
    <div class="breakdown-total"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;
};

const bind = () => {
  document.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-guest-plus]");
    const minus = event.target.closest("[data-guest-minus]");
    if (!plus && !minus) return;

    const guestsInput = document.querySelector("#guests");
    if (!guestsInput) return;

    const current = Number(guestsInput.value) || 1;
    const next = plus ? Math.min(10, current + 1) : Math.max(1, current - 1);
    guestsInput.value = String(next);
    updateBreakdown();
  });

  document.addEventListener("change", (event) => {
    if (!event.target.matches("#checkin, #checkout")) return;
    updateBreakdown();
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-booking-form]")) return;
    event.preventDefault();

    const formData = new FormData(form);
    const checkin = formData.get("checkin");
    const checkout = formData.get("checkout");
    const nights = calculateNights(checkin, checkout);
    const guests = Number(formData.get("guests"));
    const subtotal = nights * selectedHotel.pricePerNight;
    const total = subtotal + Math.round(subtotal * 0.12) + Math.round(subtotal * 0.08);

    const booking = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      guestName: formData.get("fullName"),
      email: formData.get("email"),
      checkin,
      checkout,
      guests,
      total
    };

    saveBooking(booking);
    showToast("Booking saved successfully");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
};

const init = async () => {
  initBaseUI();
  const params = getParams();
  const id = params.get("id");
  if (!id) {
    renderNotFound();
    return;
  }

  try {
    const hotels = await fetchHotels();
    selectedHotel = hotels.find((hotel) => hotel.id === id);
    if (!selectedHotel) {
      renderNotFound();
      return;
    }

    render(selectedHotel, params);
    bind();
    updateBreakdown();
  } catch {
    showToast("Failed to load booking form", "error");
  }
};

init();
