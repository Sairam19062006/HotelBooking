const amenityMeta = {
  wifi: { icon: "📶", label: "Free Wi-Fi" },
  pool: { icon: "🏊", label: "Pool" },
  spa: { icon: "💆", label: "Spa" },
  breakfast: { icon: "🥐", label: "Breakfast" },
  parking: { icon: "🅿️", label: "Parking" },
  gym: { icon: "🏋️", label: "Gym" },
  "pet-friendly": { icon: "🐾", label: "Pet friendly" },
  "airport-shuttle": { icon: "🚖", label: "Airport shuttle" },
  "bike-rental": { icon: "🚲", label: "Bike rental" }
};

const valueScore = (hotel) => hotel.rating * 100 + hotel.reviewsCount / 20 - hotel.pricePerNight * 0.22;

export const getAmenityInfo = (key) => amenityMeta[key] || { icon: "✓", label: key };

export const getAmenityPills = (hotel, limit = 4) =>
  hotel.amenities.slice(0, limit).map((item) => ({ key: item, ...getAmenityInfo(item) }));

export const getRatingLabel = (rating) => {
  if (rating >= 9.4) return "Exceptional";
  if (rating >= 9.0) return "Wonderful";
  if (rating >= 8.5) return "Excellent";
  if (rating >= 8.0) return "Very good";
  return "Good";
};

export const getDiscountPercent = (hotel) => {
  const base = Math.round((hotel.rating - 8) * 5 + (hotel.reviewsCount > 1200 ? 6 : 3));
  return Math.max(8, Math.min(24, base));
};

export const getBasePrice = (hotel) => {
  const discount = getDiscountPercent(hotel);
  return Math.round(hotel.pricePerNight / (1 - discount / 100));
};

export const getRoomsLeft = (hotel) => {
  const numeric = Number(hotel.id.replace(/\D/g, ""));
  const base = (numeric + Math.round(hotel.rating * 3)) % 5;
  return Math.max(1, base + 1);
};

export const getUrgencyText = (hotel) => {
  const rooms = getRoomsLeft(hotel);
  if (rooms <= 2) return `Only ${rooms} room${rooms === 1 ? "" : "s"} left`;
  if (rooms === 3) return "High demand • limited availability";
  return "Available now";
};

export const getDemandText = (hotel) => {
  const ratio = hotel.reviewsCount / Math.max(hotel.pricePerNight, 1);
  if (ratio > 5.5) return "Booked 12 times in last 24h";
  if (ratio > 4.1) return "Booked 8 times in last 24h";
  return "Booked 5 times in last 24h";
};

export const getBadge = (hotel) => {
  if (hotel.rating >= 9.4) return "Top Rated";
  if (valueScore(hotel) > 790) return "Best Seller";
  return "Great Value";
};

export const getValueDeal = (hotel) => {
  const discount = getDiscountPercent(hotel);
  if (discount >= 20) return "Genius deal";
  if (discount >= 14) return "Limited-time deal";
  return "Member deal";
};
