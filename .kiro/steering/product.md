# Product Overview

HEMS Ops Center is a flight simulation operations platform for Helicopter Emergency Medical Services (HEMS). It provides a tactical operations center for sim pilots to plan, execute, and track HEMS missions across flight simulators (MSFS 2020/2024, X-Plane 11/12).

Key capabilities:
- Mission generation, planning, and real-time tracking
- Pilot career progression with logbook, ranks, and achievements
- Live telemetry via a local bridge connecting flight simulators to the web app
- Fleet management, helicopter bases, and hospital directories
- Community features (posts, pilot directory, leaderboards)
- Admin command center for content, users, and operational data
- Desktop app via Electron with system tray support
- Stripe-based subscription/pricing tiers

The backend is Supabase (auth, database, real-time). The app is primarily a web SPA with an optional Electron desktop wrapper.
