import { animateOnScroll, fetchHotels, formatPrice, getFavorites, initBaseUI, showToast, toggleFavorite } from "./common.js";
import {
  getAmenityPills,
  getBadge,
  getBasePrice,
  getDemandText,
  getDiscountPercent,
  getRatingLabel,
  getUrgencyText,
  getValueDeal
} from "./hotelMeta.js";

const state = {
  hotels: [],
  filtered: [],
  filters: {
    destination: "",
    maxPrice: 500,
    minRating: 0,
    amenities: []
  },
  sortBy: "recommended"
};

const amenityOptions = ["wifi", "pool", "spa", "breakfast", "parking", "gym", "pet-friendly", "airport-shuttle"];

const scoreHotel = (hotel) => {
  const discountBoost = getDiscountPercent(hotel) * 6;
  return hotel.rating * 100 + hotel.reviewsCount / 12 + discountBoost - hotel.pricePerNight * 0.2;
};

const applyFilters = () => {
  state.filtered = state.hotels
    .filter((hotel) => {
      const destinationMatch = state.filters.destination
        ? `${hotel.city} ${hotel.country}`.toLowerCase().includes(state.filters.destination.toLowerCase())
        : true;

      const priceMatch = hotel.pricePerNight <= state.filters.maxPrice;
      const ratingMatch = hotel.rating >= state.filters.minRating;
      const amenitiesMatch = state.filters.amenities.every((item) => hotel.amenities.includes(item));

      return destinationMatch && priceMatch && ratingMatch && amenitiesMatch;
    })
    .sort((a, b) => {
      if (state.sortBy === "price-asc") return a.pricePerNight - b.pricePerNight;
      if (state.sortBy === "price-desc") return b.pricePerNight - a.pricePerNight;
      if (state.sortBy === "rating") return b.rating - a.rating;
      return scoreHotel(b) - scoreHotel(a);
    });
};

const createCard = (hotel, favorites) => {
  const currentPrice = formatPrice(hotel.pricePerNight);
  const basePrice = formatPrice(getBasePrice(hotel));
  const discount = getDiscountPercent(hotel);
  const amenities = getAmenityPills(hotel, 4);
  const ratingLabel = getRatingLabel(hotel.rating);
  const urgency = getUrgencyText(hotel);
  const demand = getDemandText(hotel);
  const badge = getBadge(hotel);
  const valueDeal = getValueDeal(hotel);

  return `
  <article class="hotel-card hotel-card-dense" data-animate>
    <div class="hotel-media-wrap">
      <img class="hotel-img" src="${hotel.images[0]}" alt="${hotel.name}">
      <button class="favorite-btn ${favorites.includes(hotel.id) ? "active" : ""}" data-favorite="${hotel.id}" aria-label="Toggle favorite">❤</button>
      <div class="badge-stack">
        <span class="status-badge badge-neutral">${badge}</span>
        <span class="status-badge badge-value">${valueDeal}</span>
      </div>
    </div>

    <div class="card-body dense-body">
      <div class="card-main">
        <h3 class="card-title">${hotel.name}</h3>
        <div class="meta">${hotel.city}, ${hotel.country}</div>
        <div class="rating-row">
          <span class="badge">${hotel.rating}</span>
          <strong>${ratingLabel}</strong>
          <span class="meta">(${hotel.reviewsCount} reviews)</span>
        </div>
        <div class="amenities-inline">
          ${amenities.map((item) => `<span class="amenity-chip">${item.icon} ${item.label}</span>`).join("")}
        </div>
      </div>

      <div class="card-side">
        <div class="value-block">
          <div class="price-line">
            <span class="price">${currentPrice}</span>
            <span class="old-price">${basePrice}</span>
          </div>
          <div class="discount-line">${discount}% off</div>
          <div class="meta">Includes taxes & fees estimate</div>
        </div>

        <div class="urgency-box">
          <div class="urgency">${urgency}</div>
          <div class="meta">${demand}</div>
        </div>

        <a href="details.html?id=${hotel.id}" class="btn btn-primary ripple" data-transition>See availability</a>
      </div>
    </div>
  </article>
`;
};

const render = () => {
  const root = document.querySelector("[data-results]");
  const count = document.querySelector("[data-count]");
  const favorites = getFavorites();

  if (!root || !count) return;

  count.textContent = `${state.filtered.length} properties found`;

  if (!state.filtered.length) {
    root.innerHTML = '<div class="glass-card" style="padding:18px">No properties match your criteria. Try changing filters or dates.</div>';
    animateOnScroll();
    return;
  }

  root.innerHTML = state.filtered.map((hotel) => createCard(hotel, favorites)).join("");
  animateOnScroll();
};

const bindSearch = () => {
  const form = document.querySelector("[data-home-search]");
  if (!form) return;

  const destinationInput = form.querySelector('input[name="destination"]');
  if (destinationInput && state.filters.destination) {
    destinationInput.value = state.filters.destination;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(form));
    window.location.href = `listings.html?${params.toString()}`;
  });
};

const bindControls = () => {
  const destinationInput = document.querySelector("[data-filter-destination]");
  const priceRange = document.querySelector("[data-filter-price]");
  const ratingSelect = document.querySelector("[data-filter-rating]");
  const amenitiesRoot = document.querySelector("[data-amenities]");
  const sortSelect = document.querySelector("[data-sort]");
  const priceValue = document.querySelector("[data-price-value]");

  if (amenitiesRoot) {
    amenitiesRoot.innerHTML = amenityOptions
      .map(
        (item) => `
        <label class="checkbox-row">
          <input type="checkbox" value="${item}" data-amenity>
          <span>${item}</span>
        </label>
      `
      )
      .join("");
  }

  destinationInput?.addEventListener("input", (event) => {
    state.filters.destination = event.target.value;
    applyFilters();
    render();
  });

  priceRange?.addEventListener("input", (event) => {
    state.filters.maxPrice = Number(event.target.value);
    if (priceValue) priceValue.textContent = `Up to ${formatPrice(state.filters.maxPrice)} / night`;
    applyFilters();
    render();
  });

  ratingSelect?.addEventListener("change", (event) => {
    state.filters.minRating = Number(event.target.value);
    applyFilters();
    render();
  });

  sortSelect?.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    applyFilters();
    render();
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches("[data-amenity]")) return;

    const checked = Array.from(document.querySelectorAll("[data-amenity]:checked")).map((el) => el.value);
    state.filters.amenities = checked;
    applyFilters();
    render();
  });

  document.addEventListener("click", (event) => {
    const favoriteBtn = event.target.closest("[data-favorite]");
    if (!favoriteBtn) return;

    const result = toggleFavorite(favoriteBtn.dataset.favorite);
    favoriteBtn.classList.toggle("active", result.exists);
    showToast(result.exists ? "Saved to favorites" : "Removed from favorites");
  });
};

const renderSkeletons = () => {
  const root = document.querySelector("[data-results]");
  if (!root) return;
  root.innerHTML = Array.from({ length: 6 })
    .map(() => '<div class="skeleton"></div>')
    .join("");
};

const hydrateFromParams = () => {
  const params = new URLSearchParams(window.location.search);
  state.filters.destination = params.get("destination") || "";

  const guests = params.get("guests");
  const checkin = params.get("checkin");
  const checkout = params.get("checkout");
  const searchSummary = document.querySelector("[data-search-summary]");
  if (searchSummary) {
    const parts = [];
    if (checkin && checkout) parts.push(`${checkin} → ${checkout}`);
    if (guests) parts.push(`${guests} guest${Number(guests) > 1 ? "s" : ""}`);
    searchSummary.textContent = parts.length ? `Showing rates for ${parts.join(" • ")}` : "Flexible rates available for selected dates";
  }

  const destinationInput = document.querySelector("[data-filter-destination]");
  if (destinationInput) destinationInput.value = state.filters.destination;

  const searchDestination = document.querySelector('[data-home-search] input[name="destination"]');
  if (searchDestination) searchDestination.value = state.filters.destination;
};

const init = async () => {
  initBaseUI();
  bindSearch();
  bindControls();
  hydrateFromParams();
  renderSkeletons();

  try {
    const hotels = await fetchHotels();
    await new Promise((resolve) => setTimeout(resolve, 500));
    state.hotels = hotels;
    applyFilters();
    render();
  } catch {
    showToast("Failed to load listings", "error");
  }
};

init();
