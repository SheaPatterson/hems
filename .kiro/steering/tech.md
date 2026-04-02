# Tech Stack & Build

## Core
- React 18 with TypeScript (strict mode off, `noImplicitAny: false`)
- Vite 5 (dev server on port 8080, SWC plugin for React)
- React Router v6 — all routes defined in `src/App.tsx`
- Tailwind CSS 3 with `tailwindcss-animate` and `@tailwindcss/typography` plugins
- shadcn/ui (default style, slate base, CSS variables) — all components pre-installed in `src/components/ui/`
- Radix UI primitives (full suite installed)
- Path alias: `@/*` maps to `./src/*`

## State & Data
- TanStack React Query for server state
- Supabase JS client for auth, database, and real-time subscriptions
- React Hook Form + Zod for form validation
- Sonner for toast notifications (also has shadcn toaster)

## UI Libraries
- Lucide React for icons
- Recharts for charts/graphs
- Leaflet + React Leaflet for maps
- Embla Carousel, React Resizable Panels, Vaul (drawer)
- next-themes for dark/light mode
- DOMPurify for HTML sanitization
- QRCode.react for QR codes

## Desktop (Electron)
- Electron 32 with `vite-plugin-electron`
- Frameless window with hidden title bar (macOS inset style)
- System tray with context menu
- Preload script with context isolation enabled

## Payments
- Stripe JS + Stripe Node SDK

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
| `npm run electron:dev` | Dev with Electron |
| `npm run electron:build` | Build Electron app (current platform) |
| `npm run electron:build:win` | Build Electron for Windows |
| `npm run electron:build:mac` | Build Electron for macOS |
| `npm run build:bridge-ui` | Build the bridge UI subset |

## Key Config
- ESLint: typescript-eslint + react-hooks + react-refresh, unused vars rule disabled
- Vite base path is `./` (relative) for Electron compatibility
- Bridge UI has a separate build mode (`--mode bridge-ui`) with its own entry point (`src/bridge-main.tsx`)
