# StayLuxe — Hotel Booking Website

StayLuxe is a multi-page hotel booking frontend built with plain HTML, CSS, and JavaScript.
It focuses on realistic booking UX: practical search, filters, trust signals, pricing context, favorites, and local booking simulation.

## Live Demo

- Production: https://sairam19062006.github.io/HotelBooking/

## Core Features

- Booking-style home page layout with:
  - destination/date/guest search
  - service tabs interactions
  - trending destinations
  - popular city tabs + show more/less
- Hotel listings page:
  - destination, rating, price, and amenities filters
  - sort options (recommended, price asc/desc, rating)
  - realistic card metadata (discount, urgency, reviews, badges)
- Hotel details page:
  - image gallery slider
  - amenities overview
  - review blocks
  - sticky booking summary card
- Booking page:
  - date and guest controls
  - automatic price breakdown
  - booking saved in browser storage
- Authentication pages:
  - formal Register and Sign in pages
  - local user/session handling
- UI system:
  - dark mode toggle
  - skeleton loaders
  - ripple interactions
  - intersection-based reveal animations
  - toast notifications

## Tech Stack

- HTML5 (multi-page app)
- CSS3 (custom responsive design system)
- Vanilla JavaScript (ES modules)
- localStorage for favorites, bookings, and auth session
- GitHub Actions + `gh-pages` branch for deployment

## Project Structure

```
HotelBooking/
├── .github/workflows/deploy.yml
├── data/
│   └── hotels.json
├── js/
│   ├── auth.js
│   ├── booking.js
│   ├── common.js
│   ├── details.js
│   ├── home.js
│   ├── hotelMeta.js
│   └── listings.js
├── styles/
│   └── main.css
├── index.html
├── listings.html
├── details.html
├── booking.html
├── signin.html
└── register.html
```

## Local Development

Because this app uses `fetch` for local JSON files, run it over HTTP (not `file://`).

1. Clone the repository
2. Start a local static server from project root:

```bash
python3 -m http.server 8080
```

3. Open:

- http://localhost:8080/index.html

## Authentication & Data Persistence

This project uses browser `localStorage` for demo behavior.

### Auth keys

- `hb-users`: registered users array
- `hb-auth-user`: active signed-in user session

### App keys

- `hb-favorites`: favorite hotel IDs
- `hb-bookings`: saved booking records
- `hb-theme`: `light` / `dark`

> Note: This is frontend-only demo auth and not secure for production.

## Deployment

Deployment is automated via GitHub Actions workflow:

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Publish target: `gh-pages` branch

### GitHub Pages settings (required once)

In repository settings:

- **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: **gh-pages**
- Folder: **/(root)**

After saving, GitHub serves the latest content from the `gh-pages` branch.

## Design Notes

- Inspired by real booking products but with custom branding/colors
- Emphasis on usability and decision clarity over overly decorative visuals
- Dense information layout to support comparison and booking decisions

## Roadmap Ideas

- Signed-in header state across all pages
- Client-side form-level validation enhancements
- Booking history dashboard page
- Better accessibility pass (focus states, ARIA labels, keyboard flow)
- Backend integration for real auth and reservations

## License

This project is currently for portfolio/demo use.
If you plan to use it commercially, add a dedicated license file and review all third-party image usage terms.
