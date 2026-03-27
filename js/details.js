import { animateOnScroll, fetchHotels, formatPrice, getFavorites, initBaseUI, showToast, toggleFavorite } from "./common.js";
import {
  getAmenityInfo,
  getBasePrice,
  getDemandText,
  getDiscountPercent,
  getRatingLabel,
  getRoomsLeft,
  getUrgencyText,
  getValueDeal
} from "./hotelMeta.js";

const amenityIcons = {
  wifi: "📶",
  pool: "🏊",
  spa: "💆",
  breakfast: "🥐",
  parking: "🅿️",
  gym: "🏋️",
  "pet-friendly": "🐾",
  "airport-shuttle": "🚖",
  "bike-rental": "🚲"
};

const getHotelId = () => new URLSearchParams(window.location.search).get("id");

const renderNotFound = () => {
  const root = document.querySelector("[data-detail-root]");
  if (!root) return;
  root.innerHTML = '<div class="glass-card" style="padding:24px">Hotel not found. <a href="listings.html" data-transition>Back to listings</a></div>';
};

const renderGallery = (hotel) => `
  <div class="gallery">
    <img src="${hotel.images[0]}" alt="${hotel.name}" data-gallery-image>
    <div class="gallery-controls">
      ${hotel.images.map((_, index) => `<button class="gallery-dot ${index === 0 ? "active" : ""}" data-gallery-dot="${index}"></button>`).join("")}
    </div>
  </div>
`;

const render = (hotel) => {
  const root = document.querySelector("[data-detail-root]");
  if (!root) return;

  const isFavorite = getFavorites().includes(hotel.id);

  root.innerHTML = `
    <section class="details-layout">
      <div>
        ${renderGallery(hotel)}
        <div class="detail-main" style="margin-top:16px" data-animate>
          <div class="card-head">
            <div>
              <h1 style="margin:0">${hotel.name}</h1>
              <p class="meta" style="margin:8px 0 0">${hotel.city}, ${hotel.country}</p>
              <div class="rating-row" style="margin-top:10px">
                <span class="badge">${hotel.rating}</span>
                <strong>${getRatingLabel(hotel.rating)}</strong>
                <span class="meta">${hotel.reviewsCount} verified reviews</span>
              </div>
            </div>
            <button class="favorite-btn ${isFavorite ? "active" : ""}" data-favorite="${hotel.id}" aria-label="Toggle favorite">❤</button>
          </div>
          <div class="detail-flags">
            <span class="status-badge badge-value">${getValueDeal(hotel)} • ${getDiscountPercent(hotel)}% off</span>
            <span class="status-badge badge-neutral">${getUrgencyText(hotel)}</span>
            <span class="meta">${getDemandText(hotel)}</span>
          </div>
          <p>${hotel.description}</p>
          <h3>Amenities</h3>
          <div class="amenity-pills">
            ${hotel.amenities
              .map((item) => {
                const amenity = getAmenityInfo(item);
                return `<span class="pill">${amenityIcons[item] || amenity.icon} ${amenity.label}</span>`;
              })
              .join("")}
          </div>
        </div>

        <section class="section" style="padding:24px 0 0" data-animate>
          <div class="section-header">
            <div>
              <h2 class="section-title">Guest Reviews</h2>
              <div class="section-subtitle">Rated ${hotel.rating} by ${hotel.reviewsCount}+ travelers</div>
            </div>
          </div>
          <div class="review-list">
            ${hotel.reviews
              .map(
                (review) => `
              <article class="review-card">
                <div class="card-head">
                  <strong>${review.author}</strong>
                  <span class="badge">${review.score}</span>
                </div>
                <p class="meta">${review.comment}</p>
              </article>
            `
              )
              .join("")}
          </div>
        </section>
      </div>

      <aside class="booking-card" data-animate>
        <h3 style="margin-top:0">Reserve your stay</h3>
        <p class="meta">Free cancellation on selected rooms</p>
        <div class="price" style="margin-bottom:6px">${formatPrice(hotel.pricePerNight)} <span class="meta">/ night</span></div>
        <div class="meta">Was ${formatPrice(getBasePrice(hotel))} • Save ${getDiscountPercent(hotel)}%</div>
        <div class="urgency" style="margin:10px 0 14px">Only ${getRoomsLeft(hotel)} room${getRoomsLeft(hotel) === 1 ? "" : "s"} left at this price</div>
        <div class="field">
          <label class="label" for="checkin">Check-in</label>
          <input class="input" id="checkin" type="date">
        </div>
        <div class="field" style="margin-top:12px">
          <label class="label" for="checkout">Check-out</label>
          <input class="input" id="checkout" type="date">
        </div>
        <div class="field" style="margin-top:12px">
          <label class="label" for="guests">Guests</label>
          <select class="select" id="guests">
            <option value="1">1 guest</option>
            <option value="2" selected>2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5">5 guests</option>
          </select>
        </div>
        <a class="btn btn-primary ripple" data-book-now style="margin-top:16px; display:inline-flex; width:100%; justify-content:center;" href="#">Proceed to Booking</a>
      </aside>
    </section>
  `;

  bindGallery(hotel);
  animateOnScroll();
};

const bindGallery = (hotel) => {
  const image = document.querySelector("[data-gallery-image]");
  const dots = document.querySelectorAll("[data-gallery-dot]");
  if (!image || !dots.length) return;

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.galleryDot);
      image.src = hotel.images[index];
      dots.forEach((item) => item.classList.remove("active"));
      dot.classList.add("active");
    });
  });
};

const bindActions = (hotel) => {
  document.addEventListener("click", (event) => {
    const favoriteBtn = event.target.closest("[data-favorite]");
    if (favoriteBtn) {
      const result = toggleFavorite(hotel.id);
      favoriteBtn.classList.toggle("active", result.exists);
      showToast(result.exists ? "Added to favorites" : "Removed from favorites");
      return;
    }

    const bookBtn = event.target.closest("[data-book-now]");
    if (!bookBtn) return;
    event.preventDefault();

    const checkin = document.querySelector("#checkin")?.value || "";
    const checkout = document.querySelector("#checkout")?.value || "";
    const guests = document.querySelector("#guests")?.value || "2";

    const params = new URLSearchParams({ id: hotel.id, checkin, checkout, guests });
    window.location.href = `booking.html?${params.toString()}`;
  });
};

const init = async () => {
  initBaseUI();
  const hotelId = getHotelId();
  if (!hotelId) {
    renderNotFound();
    return;
  }

  try {
    const hotels = await fetchHotels();
    const hotel = hotels.find((item) => item.id === hotelId);
    if (!hotel) {
      renderNotFound();
      return;
    }

    render(hotel);
    bindActions(hotel);
  } catch {
    showToast("Failed to load details", "error");
  }
};

init();
