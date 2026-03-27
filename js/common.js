const THEME_KEY = "hb-theme";
const FAVORITES_KEY = "hb-favorites";

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const getInitialTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const initThemeToggle = () => {
  const theme = getInitialTheme();
  applyTheme(theme);
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  toggle.innerHTML = theme === "dark" ? "☀️" : "🌙";

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    toggle.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} mode`);
    toggle.innerHTML = next === "dark" ? "☀️" : "🌙";
    showToast(`${next === "dark" ? "Dark" : "Light"} mode enabled`);
  });
};

export const showToast = (message, variant = "success") => {
  const root = document.querySelector("[data-toast-root]") || document.body;
  const toast = document.createElement("div");
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  root.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
};

export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
};

export const toggleFavorite = (hotelId) => {
  const current = getFavorites();
  const exists = current.includes(hotelId);
  const next = exists ? current.filter((id) => id !== hotelId) : [...current, hotelId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return { exists: !exists, next };
};

export const fetchHotels = async () => {
  const res = await fetch("./data/hotels.json");
  if (!res.ok) throw new Error("Could not fetch hotel data");
  const hotels = await res.json();
  return hotels;
};

export const formatPrice = (price) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
}).format(price);

export const animateOnScroll = () => {
  const targets = document.querySelectorAll("[data-animate]");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((item) => observer.observe(item));
};

export const initPageTransitions = () => {
  document.body.classList.add("page-enter");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-transition]");
    if (!link || link.target === "_blank" || link.href.includes("#") || event.metaKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = link.href;
    }, 220);
  });
};

export const initRipples = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".ripple");
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const circle = document.createElement("span");
    const size = Math.max(rect.width, rect.height);

    circle.className = "ripple-circle";
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${event.clientX - rect.left - size / 2}px`;
    circle.style.top = `${event.clientY - rect.top - size / 2}px`;

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 520);
  });
};

export const initBaseUI = () => {
  initThemeToggle();
  initPageTransitions();
  initRipples();
  animateOnScroll();
};
