# Mis Gastos — Frontend

SPA de **Mis Gastos**, organizada por features (Screaming Architecture).

## Stack

React + Vite + TypeScript · Tailwind CSS v4 · shadcn/ui · React Router · TanStack Query · React Hook Form + Zod · i18next · next-themes.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — compila para producción.
- `npm run typecheck` — revisa tipos con TypeScript.
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run format` / `npm run format:check` — Prettier.
- `npm test` / `npm run test:watch` — Vitest.

## Estructura

- `src/features/*` — features de negocio (auth, dashboard, incomes, expenses, budgets, insights, settings).
- `src/core/` — cliente HTTP, interceptores y errores.
- `src/shared/` — componentes de layout, i18n y utilidades.
- `src/components/ui/` — primitivas de shadcn/ui.
- `src/app/` — providers y router.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta `VITE_API_URL` a la URL del backend.
