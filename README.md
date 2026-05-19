# India Cybersecurity & AI Schemes Directory

A production-ready React directory platform for browsing state-wise cybersecurity and AI government schemes across India.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS 4
- Responsive layout with premium dark/light theme

## Data Coverage

- **28 States** + **8 Union Territories** = **36 regions**
- **8–15 AI schemes** per region
- **8–15 Cybersecurity schemes** per region
- **818 total schemes** with realistic Indian government naming

All data lives in `src/data/schemesData.js`.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── SearchBar.jsx
│   ├── FilterBar.jsx
│   ├── SortControls.jsx
│   ├── SchemeCard.jsx
│   ├── SchemeSection.jsx
│   ├── SchemeSkeleton.jsx
│   ├── EmptyState.jsx
│   ├── Footer.jsx
│   └── ThemeToggle.jsx
├── data/
│   └── schemesData.js
├── hooks/
│   ├── ThemeProvider.jsx
│   ├── themeContext.js
│   ├── useTheme.js
│   ├── useFilteredSchemes.js
│   └── useRegionLoading.js
├── layout/
│   └── MainLayout.jsx
├── pages/
│   └── HomePage.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Scheme Object Schema

Each scheme includes:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `title` | Scheme name |
| `category` | `ai` or `cybersecurity` |
| `launchYear` | Year launched |
| `description` | Full description |
| `eligibility` | Who can apply |
| `benefits` | What beneficiaries receive |
| `department` | Implementing department |
| `officialStatus` | Active, Pilot, Extended, Upcoming |
| `schemeLevel` | `state` or `central` |
| `tags` | Searchable tag array |

## Features

- Sidebar grouped by **States** and **Union Territories** with scheme counts
- Search across title, tags, benefits, description, and department
- Filters: All, AI, Cybersecurity, State Schemes, Central Schemes
- Sorting: Latest, Oldest, Title A–Z, Title Z–A
- Latest schemes filter (last 3 years)
- Expandable Read More on scheme cards
- Launch year, department, status, and tag badges
- Skeleton loading on region change
- Sticky navbar and search bar
- Footer with directory branding

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
