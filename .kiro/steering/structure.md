# Project Structure

```
src/
├── App.tsx              # All routes (React Router v6) — add new routes here
├── main.tsx             # Web app entry point
├── bridge-main.tsx      # Bridge UI entry point (separate Vite build)
├── globals.css          # Tailwind directives + CSS custom properties (light/dark themes)
├── components/
│   ├── ui/              # shadcn/ui primitives — DO NOT edit, create wrappers instead
│   ├── admin/           # Admin-specific form components
│   ├── community/       # Community feature components
│   ├── dashboard/       # Dashboard widgets (charts, leaderboard, HUD, ticker)
│   ├── maps/            # Map-related components
│   ├── mission-planning/ # Mission planning UI
│   ├── MissionControl/  # Mission control panel components
│   ├── safety/          # Safety/incident components
│   ├── simulator/       # Simulator integration UI
│   └── *.tsx            # Shared/top-level components (Layout, Sidebar, AuthGuard, etc.)
├── pages/
│   ├── admin/           # Admin pages (Overview, Users, Aircraft, Content, etc.)
│   └── *.tsx            # All other pages (Dashboard, Logbook, LiveTracking, etc.)
├── hooks/               # Custom React hooks (data fetching, state, utilities)
├── integrations/
│   ├── supabase/        # Supabase client, auth helpers, logger
│   ├── dispatch/        # Dispatch API integration
│   └── simulator/       # Simulator API integration
├── data/                # Static data (checklists, HEMS data, simulator packages)
├── lib/
│   └── utils.ts         # cn() utility (clsx + tailwind-merge)
├── types/               # TypeScript type definitions
├── utils/               # Pure utility functions (calculations, generators, audio)
└── plugins/
    └── xplane/          # X-Plane plugin code

electron/
├── main.ts              # Electron main process
└── preload.ts           # Electron preload script

public/
├── downloads/hems-dispatch/  # Bridge app bundle (standalone Node/Electron app)
└── logos/                    # Simulator logos and branding assets
```

## Conventions
- Pages go in `src/pages/`, components in `src/components/`
- Custom hooks in `src/hooks/` — named `use*.ts` (camelCase)
- External service integrations in `src/integrations/{service}/`
- Routes are centralized in `src/App.tsx` — protected routes wrap with `<AuthGuard />`, admin routes with `<AdminGuard />`
- Layout-wrapped pages nest under `<Route element={<Layout />}>`
- shadcn/ui components live in `src/components/ui/` and should not be modified directly
- Use `@/` path alias for all imports (e.g., `@/components/...`, `@/hooks/...`)
- Styling via Tailwind utility classes; theme colors use CSS custom properties defined in `globals.css`
