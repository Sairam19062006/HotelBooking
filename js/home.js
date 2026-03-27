import { animateOnScroll, fetchHotels, initBaseUI, showToast } from "./common.js";

const popularData = {
  domestic: [
    "Ooty hotels",
    "Munnar hotels",
    "Srinagar hotels",
    "Alleppey hotels",
    "Ahmedabad hotels",
    "Hyderabad hotels",
    "Mumbai hotels",
    "Rishikesh hotels",
    "Shimla hotels",
    "Ayodhya hotels",
    "Jaipur hotels",
    "Bangalore hotels",
    "Hampi hotels",
    "Nainital hotels",
    "Kolkata hotels",
    "Puri hotels",
    "Udaipur hotels",
    "Pondicherry hotels",
    "Mangalore hotels",
    "Alibaug hotels",
    "Cochin hotels",
    "Varanasi hotels",
    "Varkala hotels",
    "Lonavala hotels",
    "Tiruvannamalai hotels"
  ],
  international: [
    "Dubai hotels",
    "Singapore hotels",
    "Bangkok hotels",
    "Paris hotels",
    "London hotels",
    "Bali hotels",
    "Tokyo hotels",
    "Kuala Lumpur hotels",
    "Amsterdam hotels",
    "Istanbul hotels",
    "New York hotels",
    "Rome hotels"
  ],
  regions: [
    "Goa",
    "Kerala",
    "Rajasthan",
    "Himachal Pradesh",
    "Uttarakhand",
    "Andaman Islands",
    "South Goa",
    "North Goa",
    "Kashmir",
    "Leh-Ladakh"
  ],
  countries: ["India", "United Arab Emirates", "Thailand", "France", "Japan", "Netherlands", "Italy", "United Kingdom"],
  places: ["Hotels", "Apartments", "Resorts", "Villas", "Hostels", "Guest houses", "Homestays", "B&Bs", "Capsule hotels", "Ryokans"]
};

const cityImages = {
  Barcelona: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1200&q=80",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  Copenhagen: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80",
  Santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  Tokyo: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80",
  Amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80",
  Dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  "New York": "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80"
};

let showAllPopular = false;
let currentTab = "domestic";

const renderSkeletons = () => {
  const grid = document.querySelector("[data-trending-grid]");
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 5 }).map(() => '<div class="skeleton"></div>').join("");
};

const renderTrending = (hotels) => {
  const grid = document.querySelector("[data-trending-grid]");
  if (!grid) return;

  const trending = [...hotels].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 5);
  grid.innerHTML = trending
    .map((hotel, index) => {
      const largeClass = index < 2 ? "large" : "small";
      return `
        <a href="listings.html?destination=${encodeURIComponent(hotel.city)}" class="bk-trend-card ${largeClass}" data-transition>
          <img src="${cityImages[hotel.city] || hotel.images[0]}" alt="${hotel.city}">
          <div class="bk-trend-overlay">
            <strong>${hotel.city}</strong>
            <span>${hotel.reviewsCount} reviews</span>
          </div>
        </a>
      `;
    })
    .join("");
};

const renderPopular = () => {
  const grid = document.querySelector("[data-city-grid]");
  const showMoreBtn = document.querySelector("[data-show-more]");
  if (!grid || !showMoreBtn) return;

  const fullList = popularData[currentTab] || [];
  const visible = showAllPopular ? fullList : fullList.slice(0, 15);

  grid.innerHTML = visible.map((item) => `<a href="listings.html?destination=${encodeURIComponent(item.replace(" hotels", ""))}" data-transition>${item}</a>`).join("");

  showMoreBtn.style.display = fullList.length > 15 ? "inline-flex" : "none";
  showMoreBtn.textContent = showAllPopular ? "− Show less" : "+ Show more";
};

const bindSearch = () => {
  const form = document.querySelector("[data-home-search]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    if (document.querySelector("[data-add-flights]")?.checked) {
      params.set("withFlights", "true");
    }
    window.location.href = `listings.html?${params.toString()}`;
  });
};

const bindTabs = () => {
  const tabs = document.querySelectorAll("[data-city-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentTab = tab.dataset.cityTab;
      showAllPopular = false;
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      renderPopular();
    });
  });

  const showMoreBtn = document.querySelector("[data-show-more]");
  showMoreBtn?.addEventListener("click", () => {
    showAllPopular = !showAllPopular;
    renderPopular();
  });
};

const bindServiceTabs = () => {
  const serviceTabs = document.querySelectorAll("[data-service]");
  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      serviceTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      if (tab.dataset.service !== "stays") {
        showToast(`${tab.textContent} is coming soon`);
      }
    });
  });
};

const bindTopActions = () => {
  document.querySelector("[data-currency]")?.addEventListener("click", () => showToast("Currency selector opened"));
  document.querySelector("[data-help]")?.addEventListener("click", () => showToast("Help center opened"));
  document.querySelector("[data-list-property]")?.addEventListener("click", (event) => {
    event.preventDefault();
    showToast("Partner listing flow simulated");
  });
};

const load = async () => {
  renderSkeletons();

  const hotels = await fetchHotels();
  await new Promise((resolve) => setTimeout(resolve, 380));

  renderTrending(hotels);
  renderPopular();
  animateOnScroll();
};

const init = async () => {
  initBaseUI();
  bindSearch();
  bindTabs();
  bindServiceTabs();
  bindTopActions();

  try {
    await load();
  } catch (error) {
    showToast("Could not load hotels", "error");
  }
};

init();
